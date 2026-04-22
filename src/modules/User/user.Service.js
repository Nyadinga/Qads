const userRepository = require("./user.Repository");
const bcrypt = require("bcrypt");

const getProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    photo: user.photo,
    status: user.status,
    isVerified: user.is_verified,
    createdAt: user.created_at
  };
};

const updateProfile = async (userId, profileData) => {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }


  const updatePayload = {};
  if (profileData.firstName) updatePayload.first_name = profileData.firstName;
  if (profileData.lastName) updatePayload.last_name = profileData.lastName;
  if (profileData.email) updatePayload.email = profileData.email;
  if (profileData.phone) updatePayload.phone = profileData.phone;
  if (profileData.userName) updatePayload.username = profileData.userName;



  const updatedUser = await userRepository.updateUser(user, updatePayload);

  
  return {
    id: updatedUser.id,
    email: updatedUser.email,
    firstName: updatedUser.first_name,
    lastName: updatedUser.last_name,
    userName: updatedUser.username,
    phone: updatedUser.phone,
  };
};

const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await userRepository.findUserById(userId);
  
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }


  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
 
  const liveHash = await bcrypt.hash(oldPassword, 10);
  const liveMatch = await bcrypt.compare(oldPassword, liveHash);
 
  
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updateUser(user, { password_hash: newPasswordHash });

  return true; 
};


module.exports = {
  updateProfile,
  updatePassword,
  getProfile
};