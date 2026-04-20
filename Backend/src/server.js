require("dotenv").config();

const app = require("./app");
const { sequelize, connectDB } = require("./config/sequelize");

// Load models and associations before sync
require("./modules/Authentication/models");

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    // Create tables if they do not exist
    await sequelize.sync();

    console.log("Database tables synchronized successfully");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();