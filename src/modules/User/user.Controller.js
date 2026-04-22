const userService = require("./user.Service");

const getUserProfile = async (req, res) => {
  try {
   
    const userId = req.params.id; 
    const profileData = await userService.getProfile(userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profileData
    });

  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id, email, firstName, lastName, userName, phone } = req.body;
    
    const userId = id; 

    const updatedUser = await userService.updateProfile(userId, {
      email,
      firstName,
      lastName,
      userName,
      phone
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
   
    if (error.status === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: "Email or phone already in use." });
    }

    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};


const updatePassword = async (req, res) => {
  try {
 
    const {id, oldPassword, newPassword } = req.body;
    
   
    const userId = id; 

   
    await userService.updatePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {

    if (error.status === 404 || error.status === 400) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

module.exports = { updateUserProfile, updatePassword, getUserProfile };