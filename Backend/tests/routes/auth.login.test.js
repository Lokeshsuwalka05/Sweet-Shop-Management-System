const request = require("supertest");
const { app } = require("../../src/app");
const { User } = require("../../src/models/user");
const bcrypt = require("bcrypt");

describe("POST /api/auth/login", () => {
  const userData = {
    firstName: "Lokesh",
    lastName: "Suwalka",
    emailId: "lokesh@test.com",
    password: "Password@123",
  };

  beforeEach(async () => {
    // Create a user before each login test
    await request(app).post("/api/auth/register").send(userData);
  });

  test("should login user successfully with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailId: userData.emailId,
      password: userData.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.emailId).toBe(userData.emailId);
    expect(res.body.message).toBe("Login successful");
  });

  test("should return 401 for non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailId: "nonexistent@test.com",
      password: userData.password,
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  test("should return 401 for incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailId: userData.emailId,
      password: "WrongPassword@123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  test("should return 400 for missing email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: userData.password,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should return 400 for missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailId: userData.emailId,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should return 400 for invalid email format", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailId: "invalid-email",
      password: userData.password,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid Email");
  });

  test("should set JWT token as httpOnly cookie on successful login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      emailId: userData.emailId,
      password: userData.password,
    });

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("token=");
  });
});
