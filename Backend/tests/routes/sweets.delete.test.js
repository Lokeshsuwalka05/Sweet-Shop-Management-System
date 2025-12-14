const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");

describe("DELETE /api/sweets/:id", () => {
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
    });
    sweetId = sweet._id.toString();
  });

  test("should delete sweet successfully by admin", async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();

    const deleted = await Sweet.findById(sweetId);
    expect(deleted).toBeNull();
  });

  test("should return 404 for non-existent sweet", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .delete(`/api/sweets/${fakeId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("should return 400 for invalid sweet id format", async () => {
    const res = await request(app)
      .delete(`/api/sweets/invalid-id`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should require authentication", async () => {
    const res = await request(app).delete(`/api/sweets/${sweetId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  test("should reject non-admin users", async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set("Cookie", userCookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });
});
