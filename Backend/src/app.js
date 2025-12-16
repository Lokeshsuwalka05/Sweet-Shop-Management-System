const express = require("express");
const { authRouter } = require("./routes/auth");
const { sweetsRouter } = require("./routes/sweets");
const { inventoryRouter } = require("./routes/inventory");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { profileRouter } = require("./routes/profile");
const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow configuring CORS origins via env (comma-separated), fallback to local Vite dev server
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use("/", authRouter);
app.use("/", sweetsRouter);
app.use("/", inventoryRouter);
app.use("/", profileRouter);
module.exports = { app };
