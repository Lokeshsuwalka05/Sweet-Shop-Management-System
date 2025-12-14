const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");

describe("POST /api/sweets/:id/restock", () => {
  let adminCookie;
  let userCookie;
  let sweetId;

  const createUserAndToken = async (role = "user") => {
    const passwordHash = await bcrypt.hash("Password@123", 10);
    const user = new User({
      firstName: "Test",
      lastName: "User",
      emailId: `${role}-${Date.now()}@test.com`,
      passwordHash,
      role,
    });
    await user.save();
    return user.getJWT();
  };

  beforeEach(async () => {
    const adminToken = await createUserAndToken("admin");
    adminCookie = [`token=${adminToken}; HttpOnly`];

    const userToken = await createUserAndToken("user");
    userCookie = [`token=${userToken}; HttpOnly`];

    const sweet = await Sweet.create({
      name: "Gulab Jamun",
      category: "Dessert",
      price: 120,
      stock: 10,
      isAvailable: true,
    });
    sweetId = sweet._id.toString();
  });

  test("should restock sweet and increase stock by admin", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set("Cookie", adminCookie)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.sweet).toBeDefined();
    expect(res.body.sweet.stock).toBe(15);
  });

  test("should restore availability when restocking out-of-stock sweet", async () => {
    // First, set stock to 0 and isAvailable to false
    await Sweet.findByIdAndUpdate(sweetId, { stock: 0, isAvailable: false });

    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set("Cookie", adminCookie)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.sweet.stock).toBe(5);
    expect(res.body.sweet.isAvailable).toBe(true);
  });

  test("should validate invalid quantity", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set("Cookie", adminCookie)
      .send({ quantity: -2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should return 404 for non-existent sweet", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .post(`/api/sweets/${fakeId}/restock`)
      .set("Cookie", adminCookie)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("should reject non-admin users", async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set("Cookie", userCookie)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });
});
