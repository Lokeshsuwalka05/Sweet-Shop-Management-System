require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("../src/config/Database");
const { User } = require("../src/models/user");

const parsedSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
const saltRounds =
  Number.isFinite(parsedSaltRounds) && parsedSaltRounds > 0
    ? parsedSaltRounds
    : 10;

const required = (value, name) => {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
};

async function seedAdmin() {
  await connectDB();

  const emailId = required(process.env.ADMIN_EMAIL, "ADMIN_EMAIL");
  const password = required(process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD");
  const firstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const lastName = process.env.ADMIN_LAST_NAME || "User";

  const existing = await User.findOne({ emailId });
  if (existing) {
    console.log(`Admin already exists: ${emailId}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  await User.create({
    firstName,
    lastName,
    emailId,
    passwordHash,
    role: "admin",
  });

  console.log(`Seeded admin: ${emailId}`);
}

seedAdmin()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed", err.message || err);
    process.exit(1);
  });
