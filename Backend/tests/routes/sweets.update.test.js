const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");

describe("PUT /api/sweets/:id", () => {
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

    // Create a sweet to update
    const sweet = await Sweet.create({
      name: "Gulab Jamun",
      category: "Dessert",
      price: 120,
      stock: 10,
      description: "Sweet milk solids",
      isAvailable: true,
    });
    sweetId = sweet._id.toString();
  });

  test("should update sweet successfully by admin", async () => {
    const updateData = {
      name: "Premium Gulab Jamun",
      price: 150,
      stock: 20,
    };
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set("Cookie", adminCookie)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.sweet).toBeDefined();
    expect(res.body.sweet.name).toBe("Premium Gulab Jamun");
    expect(res.body.sweet.price).toBe(150);
    expect(res.body.sweet.stock).toBe(20);
  });
  test("should Not only allowed sweets which has the price of above 200  ", async () => {
    const updateData = {
      name: "Luxury Sweet",
      price: 250,
    };
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set("Cookie", adminCookie)
      .send(updateData);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Price cannot exceed 200");
  });

  test("should return 404 for non-existent sweet", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .put(`/api/sweets/${fakeId}`)
      .set("Cookie", adminCookie)
      .send({ price: 100 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("should validate negative price", async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set("Cookie", adminCookie)
      .send({ price: -50 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should require authentication", async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .send({ price: 100 });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  test("should reject non-admin users", async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set("Cookie", userCookie)
      .send({ price: 100 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });
});
