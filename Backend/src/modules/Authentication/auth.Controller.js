const authService = require("./auth.Service");

const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, phone, password } = req.body;

    const newUser = await authService.register({
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser };