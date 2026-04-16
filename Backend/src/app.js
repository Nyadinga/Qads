const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

const corsOptions= {
    allowedHeaders: ["Content-Type", "Authorization"],
    Credentials: true,
    origin: "http://localhost:4000"
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));




























module.exports = app;