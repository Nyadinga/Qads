// 1. Change { sequelize } to { Sequelize } (Capital S)
const { Sequelize } = require("sequelize");
console.log("DB Config Check:", {
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});
// 2. This is now fine because "sequelize" is different from "Sequelize"
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL + Sequelize connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};