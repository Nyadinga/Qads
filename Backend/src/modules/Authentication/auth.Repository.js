const { User, AuthVerificationSession } = require("./models");

const findUserByEmail = async (email) => {
  return await User.findOne({
    where: { email },
    attributes: ["id", "email"],
  });
};

const findUserByPhone = async (phone) => {
  return await User.findOne({
    where: { phone },
    attributes: ["id", "phone"],
  });
};

const createUser = async (
  {
    firstName,
    lastName,
    username,
    email,
    phone,
    passwordHash,
  },
  transaction
) => {
  return await User.create(
    {
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      phone,
      password_hash: passwordHash,
    },
    transaction ? { transaction } : undefined
  );
};

const createVerificationSession = async (
  {
    id,
    userId,
    purpose,
    otpCode,
    deliveryChannel,
    targetValue,
    expiresAt,
  },
  transaction
) => {
  return await AuthVerificationSession.create(
    {
      id,
      user_id: userId,
      purpose,
      otp_code: otpCode,
      delivery_channel: deliveryChannel,
      target_value: targetValue,
      expires_at: expiresAt,
    },
    transaction ? { transaction } : undefined
  );
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  createUser,
  createVerificationSession,
};