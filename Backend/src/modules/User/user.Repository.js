const  User = require("../Authentication/models/user.model"); 

const findUserById = async (id) => {
  return await User.findByPk(id);
};

const updateUser = async (userInstance, updateData) => {
  return await userInstance.update(updateData);
};

module.exports = {
  findUserById,
  updateUser,
};