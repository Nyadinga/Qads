const { verifyAccessToken } = require("../utils/jwt");

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Authorization token is required.");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      const error = new Error("Invalid access token.");
      error.statusCode = 401;
      throw error;
    }

    req.auth = {
      userId: payload.sub,
      sessionId: payload.sessionId,
      type: payload.type,
    };

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

module.exports = {
  requireAuth,
};