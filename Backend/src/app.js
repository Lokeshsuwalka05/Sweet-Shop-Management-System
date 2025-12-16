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
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use("/", authRouter);
app.use("/", sweetsRouter);
app.use("/", inventoryRouter);
app.use("/", profileRouter);
module.exports = { app };
