const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");
afterEach(async () => {
  await Sweet.deleteMany({});
  await User.deleteMany({});
});
describe("GET /api/sweets/search", () => {
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

    // Seed test sweets
    await Sweet.create([
      {
        name: "Gulab Jamun",
        category: "Dessert",
        price: 120,
        stock: 10,
      },
      {
        name: "Rasgulla",
        category: "Dessert",
        price: 100,
        stock: 15,
      },
      {
        name: "Kaju Katli",
        category: "Mithai",
        price: 500,
        stock: 5,
      },
      {
        name: "Jalebi",
        category: "Snack",
        price: 80,
        stock: 20,
      },
      {
        name: "Barfi",
        category: "Mithai",
        price: 300,
        stock: 8,
      },
    ]);
  });

  test("should search sweets by name", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ name: "Gulab" })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets).toBeDefined();
    expect(res.body.sweets.length).toBe(1);
    expect(res.body.sweets[0].name).toBe("Gulab Jamun");
  });

  test("should search sweets by category", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ category: "Mithai" })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(2);
    expect(res.body.sweets[0].category).toBe("Mithai");
    expect(res.body.sweets[1].category).toBe("Mithai");
  });

  test("should search sweets by price range (min and max)", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ priceMin: 100, priceMax: 200 })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(2);
    expect(res.body.sweets.every((s) => s.price >= 100 && s.price <= 200)).toBe(
      true
    );
  });

  test("should search sweets by minimum price only", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ priceMin: 300 })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(2);
    expect(res.body.sweets.every((s) => s.price >= 300)).toBe(true);
  });

  test.only("should search sweets by maximum price only", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ maxPrice: 100 })
      .set("Cookie", userCookie);
    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(2);
    expect(res.body.sweets.every((s) => s.price <= 100)).toBe(true);
  });

  test("should combine name and category filters", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ name: "Kaju", category: "Mithai" })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(1);
    expect(res.body.sweets[0].name).toBe("Kaju Katli");
    expect(res.body.sweets[0].category).toBe("Mithai");
  });

  test("should combine category and price range", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ category: "Dessert", priceMax: 110 })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(1);
    expect(res.body.sweets[0].name).toBe("Rasgulla");
  });

  test("should return empty array when no match found", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ name: "NonExistent" })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets).toEqual([]);
  });

  test("should return all sweets when no query params provided", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(5);
  });

  test("should require authentication", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ name: "Gulab" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  test("should perform case-insensitive search for name", async () => {
    const res = await request(app)
      .get("/api/sweets/search")
      .query({ name: "gulab" })
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body.sweets.length).toBe(1);
    expect(res.body.sweets[0].name).toBe("Gulab Jamun");
  });
});
