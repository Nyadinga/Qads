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

const resendLoginOtp = async (req, res, next) => {
  try {
    const { verificationSessionId } = req.body;

    const result = await authService.resendLoginOtp({
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


const verifyLoginOtp = async (req, res, next) => {
  try {
    const { verificationSessionId, otpCode } = req.body;

    const result = await authService.verifyLoginOtp({
      verificationSessionId,
      otpCode,
      meta: {
        ipAddress: req.ip || req.socket?.remoteAddress || null,
        userAgent: req.get("user-agent") || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        sessionId: result.sessionId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/// logout logic
const logoutUser = async (req, res, next) => {
  try {
    const result = await authService.logout({
      sessionId: req.auth.sessionId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/// password logic 
const forgotPasswordUser = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    const result = await authService.forgotPassword({
      identifier,
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

const resetPasswordUser = async (req, res, next) => {
  try {
    const { verificationSessionId, otpCode, newPassword } = req.body;

    const result = await authService.resetPassword({
      verificationSessionId,
      otpCode,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
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
  resendLoginOtp,
  logoutUser,
  forgotPasswordUser,
  resetPasswordUser,
};