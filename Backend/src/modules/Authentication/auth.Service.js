const bcrypt = require("bcrypt");
const crypto = require("crypto");
const authRepository = require("./auth.repository");
const { sequelize } = require("../../config/sequelize");
const { sendWhatsAppOtp, sendEmailOtp } = require("./otp.delivery");

const register = async ({
  firstName,
  lastName,
  username,
  email,
  phone,
  password,
}) => {
  const existingEmail = await authRepository.findUserByEmail(email);
  if (existingEmail) {
    const error = new Error("Email already taken");
    error.statusCode = 409;
    throw error;
  }

  const existingPhone = await authRepository.findUserByPhone(phone);
  if (existingPhone) {
    const error = new Error("Phone number already taken");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationSessionId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000)
  );

  let transaction;

  try {
    transaction = await sequelize.transaction();

    const user = await authRepository.createUser(
      {
        firstName,
        lastName,
        username,
        email,
        phone,
        passwordHash,
      },
      transaction
    );

    let deliveryResult;
    let responseMessage;

    try {
      deliveryResult = await sendWhatsAppOtp({ phone, otpCode });
      responseMessage = "OTP sent to your WhatsApp number.";
    } catch (whatsappError) {
      deliveryResult = await sendEmailOtp({ email, otpCode });
      responseMessage =
        responseMessage =
                  "WhatsApp verification is currently unavailable. Your OTP has been sent to your email.";
    }

    const session = await authRepository.createVerificationSession(
      {
        id: verificationSessionId,
        userId: user.id,
        purpose: "register",
        otpCode,
        deliveryChannel: deliveryResult.channel,
        targetValue: deliveryResult.targetValue,
        expiresAt,
      },
      transaction
    );

    await transaction.commit();

    return {
      message: responseMessage,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isVerified: user.is_verified,
        createdAt: user.created_at,
      },
      verificationSessionId: session.id,
      deliveryChannel: session.delivery_channel,
      expiresAt: session.expires_at,
    };
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }

    throw error;
  }
};

module.exports = { register };