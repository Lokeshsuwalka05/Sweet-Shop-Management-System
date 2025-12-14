const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");

describe("POST /api/sweets", () => {
  let adminCookie;

  const createUserAndToken = async (role = "admin") => {
    const passwordHash = await bcrypt.hash("Password@123", 10);
    const user = new User({
      firstName: "Test",
      lastName: "User",
      emailId: `${role}@test.com`,
      passwordHash,
      role,
    });
    await user.save();
    return user.getJWT();
  };

  beforeEach(async () => {
    const token = await createUserAndToken("admin");
    adminCookie = [`token=${token}; HttpOnly`];
  });

  const payload = {
    name: "Gulab Jamun",
    category: "Dessert",
    price: 120,
    stock: 15,
    description: "Soft milk solids balls soaked in sugar syrup",
    ingredients: ["Milk", "Sugar", "Cardamom"],
    imageUrl: "https://example.com/gulab-jamun.jpg",
  };

  test("creates sweet successfully", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Cookie", adminCookie)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.sweet).toBeDefined();
    expect(res.body.sweet.name).toBe(payload.name);

    const inDb = await Sweet.findOne({ name: payload.name });
    expect(inDb).toBeTruthy();
    expect(inDb.price).toBe(payload.price);
  });

  test("validates required fields", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Cookie", adminCookie)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("rejects negative price and stock", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Cookie", adminCookie)
      .send({ name: "Ladoo", category: "Snack", price: -1, stock: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("requires authentication", async () => {
    const res = await request(app).post("/api/sweets").send(payload);
    expect(res.status).toBe(401);
  });

  test("rejects non-admin users", async () => {
    const userToken = await createUserAndToken("user");
    const res = await request(app)
      .post("/api/sweets")
      .set("Cookie", [`token=${userToken}; HttpOnly`])
      .send(payload);
    expect(res.status).toBe(403);
  });
});
