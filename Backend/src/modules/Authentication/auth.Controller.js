const authService = require("./auth.service");

const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, phone, password } = req.body;

    const result = await authService.register({
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
    });

    return res.status(201).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        verificationSessionId: result.verificationSessionId,
        deliveryChannel: result.deliveryChannel,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyRegisterOtp = async (req, res, next) => {
  try {
    const { verificationSessionId, otpCode } = req.body;

    const result = await authService.verifyRegisterOtp({
      verificationSessionId,
      otpCode,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const resendRegisterOtp = async (req, res, next) => {
  try {
    const { verificationSessionId } = req.body;

    const result = await authService.resendRegisterOtp({
      verificationSessionId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        verificationSessionId: result.verificationSessionId,
        deliveryChannel: result.deliveryChannel,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const result = await authService.login({
      identifier,
      password,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        verificationSessionId: result.verificationSessionId,
        deliveryChannel: result.deliveryChannel,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const { verificationSessionId, otpCode } = req.body;

    const result = await authService.verifyLoginOtp({
      verificationSessionId,
      otpCode,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
  loginUser,
  verifyLoginOtp,
};