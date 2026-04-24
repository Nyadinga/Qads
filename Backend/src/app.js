const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./modules/Authentication/auth.Routes");
const userRoutes = require("./modules/User/user.Route");
const campaignRoutes = require("./modules/Campaign/campaign.Route");
const errorMiddleware = require("./middlewares/error.Middleware");
const { swaggerUi, specs } = require('./utils/swaggerConfig');

const app = express();

const corsOptions = {
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/campaign", campaignRoutes);
app.use(errorMiddleware);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app;
























module.exports = app;