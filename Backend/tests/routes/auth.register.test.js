const request = require("supertest");
const { app } = require("../../src/app");
const { User } = require("../../src/models/user");

describe("POST /api/auth/register", () => {
  const userData = {
    firstName: "Lokesh",
    lastName: "Suwalka",
    emailId: "lokesh@test.com",
    password: "Password@123",
  };

  test("should register user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.emailId).toBe(userData.emailId);
  });

  test("should not allow duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  test("should return 400 for invalid signup data", async () => {
    const res = await request(app).post("/api/auth/register").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should hash password before saving user", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const user = await User.findOne({ emailId: userData.emailId });

    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe(userData.password);
  });

  test("should set JWT token as httpOnly cookie", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("token=");
  });
});
