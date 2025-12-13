const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);
//instance methods
userSchema.methods.getJWT = function () {
  const user = this;
  //here this.id is a mongoose getter that's why it directly returns a id
  const id = this.id;
  const token = jwt.sign({ _id: id }, JWT_SECRET, { expiresIn: "1d" });
  return token;
};
const User = mongoose.model("User", userSchema);
module.exports = { User };
