const bcrypt = require("bcrypt");
const authRepository = require("./auth.repository");

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

  const user = await authRepository.createUser({
    firstName,
    lastName,
    username,
    email,
    phone,
    passwordHash,
  });

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    status: user.status,
    isVerified: user.is_verified,
    createdAt: user.created_at,
  };
};

module.exports = { register };