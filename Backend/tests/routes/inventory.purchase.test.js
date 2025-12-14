const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");

describe("POST /api/sweets/:id/purchase", () => {
  let userCookie;
  let sweetId;

  const createUserAndToken = async () => {
    const passwordHash = await bcrypt.hash("Password@123", 10);
    const user = new User({
      firstName: "Buyer",
      lastName: "User",
      emailId: `buyer-${Date.now()}@test.com`,
      passwordHash,
      role: "user",
    });
    await user.save();
    return user.getJWT();
  };

  beforeEach(async () => {
    const token = await createUserAndToken();
    userCookie = [`token=${token}; HttpOnly`];

    const sweet = await Sweet.create({
      name: "Gulab Jamun",
      category: "Dessert",
      price: 120,
      stock: 10,
      isAvailable: true,
    });
    sweetId = sweet._id.toString();
  });

  test("should purchase sweet and decrement stock", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Cookie", userCookie)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.sweet).toBeDefined();
    expect(res.body.sweet.stock).toBe(7);
  });

  test("should validate missing or invalid quantity", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Cookie", userCookie)
      .send({ quantity: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should return 400 when quantity exceeds stock", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set("Cookie", userCookie)
      .send({ quantity: 20 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Insufficient stock");
  });

  test("should return 404 for non-existent sweet", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .post(`/api/sweets/${fakeId}/purchase`)
      .set("Cookie", userCookie)
      .send({ quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("should require authentication", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .send({ quantity: 1 });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });
});
