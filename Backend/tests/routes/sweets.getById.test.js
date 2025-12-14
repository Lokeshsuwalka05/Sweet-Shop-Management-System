const request = require("supertest");
const bcrypt = require("bcrypt");
const { app } = require("../../src/app");
const { Sweet } = require("../../src/models/sweet");
const { User } = require("../../src/models/user");

describe("GET /api/sweets/:id", () => {
  let userCookie;
  let sweet;

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
    const token = await createUserAndToken();
    userCookie = [`token=${token}; HttpOnly`];

    sweet = await Sweet.create({
      name: "Gulab Jamun",
      category: "Dessert",
      price: 120,
      stock: 10,
      description: "Soft and sweet",
      ingredients: ["Milk", "Sugar"],
      imageUrl: "http://example.com/gulab.jpg",
    });
  });

  afterEach(async () => {
    await Sweet.deleteMany({});
    await User.deleteMany({});
  });

  test("returns sweet details for valid id", async () => {
    const res = await request(app)
      .get(`/api/sweets/${sweet._id}`)
      .set("Cookie", userCookie);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(String(sweet._id));
    expect(res.body.name).toBe("Gulab Jamun");
    expect(res.body.price).toBe(120);
    expect(res.body.stock).toBe(10);
  });

  test("returns 404 when sweet not found", async () => {
    const missingId = "000000000000000000000000";
    const res = await request(app)
      .get(`/api/sweets/${missingId}`)
      .set("Cookie", userCookie);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Sweet not found");
  });

  test("returns 400 for invalid id format", async () => {
    const res = await request(app)
      .get("/api/sweets/not-a-valid-id")
      .set("Cookie", userCookie);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid sweet ID format");
  });

  test("requires authentication", async () => {
    const res = await request(app).get(`/api/sweets/${sweet._id}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });
});
