const { User, AuthVerificationSession,UserSession } = require("./models");
const { Op } = require("sequelize");

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

const findUserById = async (id) => {
  return await User.findByPk(id);
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
const findUserByIdentifier = async (identifier) => {
  return await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { phone: identifier }],
    },
  });
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

const findVerificationSessionById = async (id) => {
  return await AuthVerificationSession.findByPk(id);
};

const cancelVerificationSession = async (session, transaction) => {
  return await session.update(
    {
      status: "cancelled",
    },
    transaction ? { transaction } : undefined
  );
};

const markVerificationSessionExpired = async (session, transaction) => {
  return await session.update(
    { status: "expired" },
    transaction ? { transaction } : undefined
  );
};

const incrementVerificationAttempts = async (session, transaction) => {
  const nextAttempts = session.attempts + 1;
  const nextStatus =
    nextAttempts >= session.max_attempts ? "cancelled" : session.status;

  await session.update(
    {
      attempts: nextAttempts,
      status: nextStatus,
    },
    transaction ? { transaction } : undefined
  );

  return {
    attempts: nextAttempts,
    status: nextStatus,
  };
};

const markVerificationSessionVerified = async (session, transaction) => {
  return await session.update(
    {
      status: "verified",
      verified_at: new Date(),
    },
    transaction ? { transaction } : undefined
  );
};

const activateUser = async (userId, transaction) => {
  return await User.update(
    {
      status: "active",
      is_verified: true,
      verified_at: new Date(),
    },
    {
      where: { id: userId },
      ...(transaction ? { transaction } : {}),
    }
  );
};

const createUserSession = async (payload, transaction) => {
  return await UserSession.create(
    payload,
    transaction ? { transaction } : undefined
  );
};

const updateUserLastLogin = async (userId, ipAddress, transaction) => {
  return await User.update(
    {
      last_login_at: new Date(),
      last_login_ip: ipAddress,
    },
    {
      where: { id: userId },
      ...(transaction ? { transaction } : {}),
    }
  );
};

//logout logic 
const findActiveUserSessionById = async (sessionId) => {
  return await UserSession.findOne({
    where: {
      id: sessionId,
      is_active: true,
    },
  });
};

const revokeUserSession = async (session, transaction) => {
  return await session.update(
    {
      is_active: false,
      revoked_at: new Date(),
    },
    transaction ? { transaction } : undefined
  );
};
///password repository logic 
const updateUserPassword = async (userId, passwordHash, transaction) => {
  return await User.update(
    {
      password_hash: passwordHash,
    },
    {
      where: { id: userId },
      ...(transaction ? { transaction } : {}),
    }
  );
};

const revokeAllUserSessionsForUser = async (userId, transaction) => {
  return await UserSession.update(
    {
      is_active: false,
      revoked_at: new Date(),
    },
    {
      where: {
        user_id: userId,
        is_active: true,
      },
      ...(transaction ? { transaction } : {}),
    }
  );
};
module.exports = {
  findUserByEmail,
  findUserByPhone,
  findUserByIdentifier,
  findUserById,
  createUser,
  createVerificationSession,
  findVerificationSessionById,
  cancelVerificationSession,
  markVerificationSessionExpired,
  incrementVerificationAttempts,
  markVerificationSessionVerified,
  activateUser,
  createUserSession,
  updateUserLastLogin,
  findActiveUserSessionById,
  revokeUserSession,
  updateUserPassword,
  revokeAllUserSessionsForUser,
};