const bcrypt = require("bcrypt");
const crypto = require("crypto");
const authRepository = require("./auth.repository");
const { sequelize } = require("../../config/sequelize");
const { sendWhatsAppOtp, sendEmailOtp } = require("./otp.delivery");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/jwt");
const { hashToken } = require("../../utils/hash");

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
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
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

const verifyRegisterOtp = async ({ verificationSessionId, otpCode }) => {
  const session = await authRepository.findVerificationSessionById(
    verificationSessionId
  );

  if (!session) {
    const error = new Error("Verification session not found.");
    error.statusCode = 404;
    throw error;
  }

  if (session.purpose !== "register") {
    const error = new Error("Invalid verification session purpose.");
    error.statusCode = 400;
    throw error;
  }

  if (session.status !== "pending") {
    const error = new Error("This verification session is no longer pending.");
    error.statusCode = 400;
    throw error;
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await authRepository.markVerificationSessionExpired(session);

    const error = new Error("OTP code has expired.");
    error.statusCode = 400;
    throw error;
  }

  if (session.otp_code !== otpCode) {
    const result = await authRepository.incrementVerificationAttempts(session);

    const remainingAttempts = Math.max(
      session.max_attempts - result.attempts,
      0
    );

    const error =
      result.status === "cancelled"
        ? new Error(
            "Too many invalid attempts. This verification session has been cancelled."
          )
        : new Error("Invalid OTP code.");

    error.statusCode = 400;
    error.details = {
      remainingAttempts,
    };

    throw error;
  }

  let transaction;

  try {
    transaction = await sequelize.transaction();

    await authRepository.markVerificationSessionVerified(session, transaction);
    await authRepository.activateUser(session.user_id, transaction);

    await transaction.commit();

    return {
      message: "Account verified successfully.",
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

const resendRegisterOtp = async ({ verificationSessionId }) => {
  const oldSession = await authRepository.findVerificationSessionById(
    verificationSessionId
  );

  if (!oldSession) {
    const error = new Error("Verification session not found.");
    error.statusCode = 404;
    throw error;
  }

  if (oldSession.purpose !== "register") {
    const error = new Error("Invalid verification session purpose.");
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.findUserById(oldSession.user_id);

  if (!user) {
    const error = new Error("User not found for this verification session.");
    error.statusCode = 404;
    throw error;
  }

  if (user.is_verified || user.status === "active") {
    const error = new Error("This account is already verified.");
    error.statusCode = 400;
    throw error;
  }

  if (oldSession.status === "verified") {
    const error = new Error("This verification session has already been used.");
    error.statusCode = 400;
    throw error;
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const newSessionId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
  );

  let transaction;

  try {
    transaction = await sequelize.transaction();

    if (oldSession.status === "pending") {
      await authRepository.cancelVerificationSession(oldSession, transaction);
    }

    let deliveryResult;
    let responseMessage;

    try {
      deliveryResult = await sendWhatsAppOtp({
        phone: user.phone,
        otpCode,
      });
      responseMessage = "A new OTP has been sent to your WhatsApp number.";
    } catch (whatsappError) {
      deliveryResult = await sendEmailOtp({
        email: user.email,
        otpCode,
      });
      responseMessage =
        "WhatsApp verification is currently unavailable. A new OTP has been sent to your email.";
    }

    const newSession = await authRepository.createVerificationSession(
      {
        id: newSessionId,
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
      verificationSessionId: newSession.id,
      deliveryChannel: newSession.delivery_channel,
      expiresAt: newSession.expires_at,
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


const login = async ({ identifier, password }) => {
  const user = await authRepository.findUserByIdentifier(identifier);

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "suspended") {
    const error = new Error("This account has been suspended.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.is_verified || user.status !== "active") {
    const error = new Error("This account is not verified yet.");
    error.statusCode = 403;
    throw error;
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationSessionId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
  );

  let deliveryResult;
  let responseMessage;

  try {
    deliveryResult = await sendWhatsAppOtp({
      phone: user.phone,
      otpCode,
    });
    responseMessage = "OTP sent to your WhatsApp number.";
  } catch (whatsappError) {
    deliveryResult = await sendEmailOtp({
      email: user.email,
      otpCode,
    });
    responseMessage =
      "WhatsApp verification is currently unavailable. Your OTP has been sent to your email.";
  }

  const session = await authRepository.createVerificationSession({
    id: verificationSessionId,
    userId: user.id,
    purpose: "login",
    otpCode,
    deliveryChannel: deliveryResult.channel,
    targetValue: deliveryResult.targetValue,
    expiresAt,
  });

  return {
    message: responseMessage,
    verificationSessionId: session.id,
    deliveryChannel: session.delivery_channel,
    expiresAt: session.expires_at,
  };
};

const verifyLoginOtp = async ({ verificationSessionId, otpCode, meta }) => {
  const session = await authRepository.findVerificationSessionById(
    verificationSessionId
  );

  if (!session) {
    const error = new Error("Verification session not found.");
    error.statusCode = 404;
    throw error;
  }

  if (session.purpose !== "login") {
    const error = new Error("Invalid verification session purpose.");
    error.statusCode = 400;
    throw error;
  }

  if (session.status !== "pending") {
    const error = new Error("This verification session is no longer pending.");
    error.statusCode = 400;
    throw error;
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await authRepository.markVerificationSessionExpired(session);

    const error = new Error("OTP code has expired.");
    error.statusCode = 400;
    throw error;
  }

  if (session.otp_code !== otpCode) {
    const result = await authRepository.incrementVerificationAttempts(session);

    const remainingAttempts = Math.max(
      session.max_attempts - result.attempts,
      0
    );

    const error =
      result.status === "cancelled"
        ? new Error(
            "Too many invalid attempts. This verification session has been cancelled."
          )
        : new Error("Invalid OTP code.");

    error.statusCode = 400;
    error.details = {
      remainingAttempts,
    };

    throw error;
  }

  const user = await authRepository.findUserById(session.user_id);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const sessionId = crypto.randomUUID();

const accessToken = generateAccessToken({
  userId: user.id,
  sessionId,
  isAdmin: user.is_admin,
});

const refreshToken = generateRefreshToken({
  userId: user.id,
  sessionId,
  isAdmin: user.is_admin,
});

  const refreshTokenHash = hashToken(refreshToken);

  const refreshSessionExpiresAt = new Date(
    Date.now() +
      Number(process.env.REFRESH_SESSION_EXPIRES_DAYS || 7) *
        24 *
        60 *
        60 *
        1000
  );

  let transaction;

  try {
    transaction = await sequelize.transaction();

    await authRepository.markVerificationSessionVerified(session, transaction);

    await authRepository.createUserSession(
      {
        id: sessionId,
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        device_name: null,
        device_type: "unknown",
        browser: null,
        os: null,
        ip_address: meta?.ipAddress || null,
        user_agent: meta?.userAgent || null,
        is_active: true,
        last_used_at: new Date(),
        expires_at: refreshSessionExpiresAt,
        revoked_at: null,
      },
      transaction
    );

    await authRepository.updateUserLastLogin(
      user.id,
      meta?.ipAddress || null,
      transaction
    );

    await transaction.commit();

    return {
      message: "Login verified successfully.",
      sessionId,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isVerified: user.is_verified,
      },
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

const resendLoginOtp = async ({ verificationSessionId }) => {
  const oldSession = await authRepository.findVerificationSessionById(
    verificationSessionId
  );

  if (!oldSession) {
    const error = new Error("Verification session not found.");
    error.statusCode = 404;
    throw error;
  }

  if (oldSession.purpose !== "login") {
    const error = new Error("Invalid verification session purpose.");
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.findUserById(oldSession.user_id);

  if (!user) {
    const error = new Error("User not found for this verification session.");
    error.statusCode = 404;
    throw error;
  }

  if (user.status === "suspended") {
    const error = new Error("This account has been suspended.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.is_verified || user.status !== "active") {
    const error = new Error("This account is not eligible for login OTP.");
    error.statusCode = 403;
    throw error;
  }

  if (oldSession.status === "verified") {
    const error = new Error("This verification session has already been used.");
    error.statusCode = 400;
    throw error;
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const newSessionId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
  );

  let transaction;

  try {
    transaction = await sequelize.transaction();

    if (oldSession.status === "pending") {
      await authRepository.cancelVerificationSession(oldSession, transaction);
    }

    let deliveryResult;
    let responseMessage;

    try {
      deliveryResult = await sendWhatsAppOtp({
        phone: user.phone,
        otpCode,
      });
      responseMessage = "A new OTP has been sent to your WhatsApp number.";
    } catch (whatsappError) {
      deliveryResult = await sendEmailOtp({
        email: user.email,
        otpCode,
      });
      responseMessage =
        "WhatsApp verification is currently unavailable. A new OTP has been sent to your email.";
    }

    const newSession = await authRepository.createVerificationSession(
      {
        id: newSessionId,
        userId: user.id,
        purpose: "login",
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
      verificationSessionId: newSession.id,
      deliveryChannel: newSession.delivery_channel,
      expiresAt: newSession.expires_at,
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

///logout logic
const logout = async ({ sessionId }) => {
  const session = await authRepository.findActiveUserSessionById(sessionId);

  if (!session) {
    const error = new Error("Session not found or already logged out.");
    error.statusCode = 404;
    throw error;
  }

  await authRepository.revokeUserSession(session);

  return {
    message: "Logged out successfully.",
  };
};
/// password logic 
const forgotPassword = async ({ identifier }) => {
  const user = await authRepository.findUserByIdentifier(identifier);

  if (!user) {
    const error = new Error("No account found with that email or phone.");
    error.statusCode = 404;
    throw error;
  }

  if (user.status === "suspended") {
    const error = new Error("This account has been suspended.");
    error.statusCode = 403;
    throw error;
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationSessionId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
  );

  let deliveryResult;
  let responseMessage;

  try {
    deliveryResult = await sendWhatsAppOtp({
      phone: user.phone,
      otpCode,
    });
    responseMessage = "OTP sent to your WhatsApp number.";
  } catch (whatsappError) {
    deliveryResult = await sendEmailOtp({
      email: user.email,
      otpCode,
    });
    responseMessage =
      "WhatsApp verification is currently unavailable. Your OTP has been sent to your email.";
  }

  const session = await authRepository.createVerificationSession({
    id: verificationSessionId,
    userId: user.id,
    purpose: "reset_password",
    otpCode,
    deliveryChannel: deliveryResult.channel,
    targetValue: deliveryResult.targetValue,
    expiresAt,
  });

  return {
    message: responseMessage,
    verificationSessionId: session.id,
    deliveryChannel: session.delivery_channel,
    expiresAt: session.expires_at,
  };
};

const resetPassword = async ({
  verificationSessionId,
  otpCode,
  newPassword,
}) => {
  const session = await authRepository.findVerificationSessionById(
    verificationSessionId
  );

  if (!session) {
    const error = new Error("Verification session not found.");
    error.statusCode = 404;
    throw error;
  }

  if (session.purpose !== "reset_password") {
    const error = new Error("Invalid verification session purpose.");
    error.statusCode = 400;
    throw error;
  }

  if (session.status !== "pending") {
    const error = new Error("This verification session is no longer pending.");
    error.statusCode = 400;
    throw error;
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await authRepository.markVerificationSessionExpired(session);

    const error = new Error("OTP code has expired.");
    error.statusCode = 400;
    throw error;
  }

  if (session.otp_code !== otpCode) {
    const result = await authRepository.incrementVerificationAttempts(session);

    const remainingAttempts = Math.max(
      session.max_attempts - result.attempts,
      0
    );

    const error =
      result.status === "cancelled"
        ? new Error(
            "Too many invalid attempts. This verification session has been cancelled."
          )
        : new Error("Invalid OTP code.");

    error.statusCode = 400;
    error.details = {
      remainingAttempts,
    };

    throw error;
  }

  const user = await authRepository.findUserById(session.user_id);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  let transaction;

  try {
    transaction = await sequelize.transaction();

    await authRepository.updateUserPassword(user.id, passwordHash, transaction);
    await authRepository.markVerificationSessionVerified(session, transaction);
    await authRepository.revokeAllUserSessionsForUser(user.id, transaction);

    await transaction.commit();

    return {
      message: "Password reset successfully. Please log in again.",
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

module.exports = {
  register,
  verifyRegisterOtp,
  resendRegisterOtp,
  login,
  verifyLoginOtp,
  resendLoginOtp,
  logout,
  forgotPassword,
  resetPassword,
};