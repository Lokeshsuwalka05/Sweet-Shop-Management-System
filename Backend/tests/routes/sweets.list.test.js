const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");

describe("GET /api/sweets", () => {
  let userCookie;

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
    const token = await createUserAndToken("user");
    userCookie = [`token=${token}; HttpOnly`];

    // Seed some sweets
    await Sweet.create([
      {
        name: "Gulab Jamun",
        category: "Dessert",
        price: 120,
        stock: 10,
        isAvailable: true,
      },
      {
        name: "Rasgulla",
        category: "Dessert",
        price: 100,
        stock: 15,
        isAvailable: true,
      },
      {
        name: "Kaju Katli",
        category: "Mithai",
        price: 500,
        stock: 0,
        isAvailable: false,
      },
    ]);
  });

  test("should return all sweets for authenticated user", async () => {
    const res = await request(app).get("/api/sweets").set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets).toBeDefined();
    expect(res.body.sweets.length).toBe(3);
    expect(res.body.sweets[0].name).toBeDefined();
    expect(res.body.sweets[0].price).toBeDefined();
  });

  test("should return empty array when no sweets exist", async () => {
    await Sweet.deleteMany({});

    const res = await request(app).get("/api/sweets").set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets).toEqual([]);
  });

  test("should require authentication", async () => {
    const res = await request(app).get("/api/sweets");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  test("should work for both admin and regular users", async () => {
    const adminToken = await createUserAndToken("admin");
    const adminCookie = [`token=${adminToken}; HttpOnly`];

    const res = await request(app)
      .get("/api/sweets")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets).toBeDefined();
    expect(res.body.sweets.length).toBe(3);
  });

  test("should include all sweet properties", async () => {
    const res = await request(app).get("/api/sweets").set("Cookie", userCookie);

    expect(res.status).toBe(200);
    const sweet = res.body.sweets[0];
    expect(sweet._id).toBeDefined();
    expect(sweet.name).toBeDefined();
    expect(sweet.category).toBeDefined();
    expect(sweet.price).toBeDefined();
    expect(sweet.stock).toBeDefined();
    expect(sweet.isAvailable).toBeDefined();
  });
});
