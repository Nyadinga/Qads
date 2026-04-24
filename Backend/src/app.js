const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./modules/Authentication/auth.Routes");
const userRoutes = require("./modules/User/user.Route");
const advertiserRoutes = require("./modules/Campaign/advertiser/advertiser.routes");
const promoterRoutes = require("./modules/Campaign/promoter/promoter.routes");
const AdminRoutes = require("./modules/Campaign/admin/admin.routes");

const errorMiddleware = require("./middlewares/error.Middleware");
const { swaggerUi, specs } = require("./utils/swaggerConfig");

const app = express();

const corsOptions = {
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  origin: ["http://127.0.0.1:8080", "http://localhost:8080", "http://192.168.70.37:8080"],
};
 
// Global middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/campaign/advertiser", advertiserRoutes);
app.use("/campaign/promoter", promoterRoutes);
app.use("/campaign/admin", AdminRoutes);

// Error handler must be last
app.use(errorMiddleware);

module.exports = app;
























module.exports = app;