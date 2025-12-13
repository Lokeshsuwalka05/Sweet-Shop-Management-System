const jwt = require("jsonwebtoken");
const { User } = require("../../src/models/user");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

describe("User Model", () => {
  const userData = {
    firstName: "Lokesh",
    lastName: "Suwalka",
    emailId: "LOKESH@TEST.COM",
    passwordHash: "password123",
  };

  test("should create a user successfully", async () => {
    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.firstName).toBe("Lokesh");
  });

  test("should store email in lowercase", async () => {
    const user = await User.create(userData);

    expect(user.emailId).toBe("lokesh@test.com");
  });

  test("should set default role as user", async () => {
    const user = await User.create(userData);
    expect(user.role).toBe("user");
  });
});
