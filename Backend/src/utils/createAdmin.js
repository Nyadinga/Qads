require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../modules/Authentication/models/user.model");
const { sequelize } = require("../config/sequelize");

const createAdmin = async () => {
  try {
    await sequelize.authenticate();

    const passwordHash = await bcrypt.hash("AdminPass123", 10);

    const existingUser = await User.findOne({
      where: { email: "admin@example.com" },
    });

    if (existingUser) {
      await existingUser.update({
        is_admin: true,
        status: "active",
        is_verified: true,
        verified_at: new Date(),
      });

      console.log("Existing user promoted to admin.");
      process.exit(0);
    }

    await User.create({
      first_name: "System",
      last_name: "Admin",
      username: "admin",
      email: "admin@example.com",
      phone: "670000999",
      password_hash: passwordHash,
      status: "active",
      is_verified: true,
      verified_at: new Date(),
      is_admin: true,
    });

    console.log("Admin account created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();