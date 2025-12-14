const mongoose = require("mongoose");
const { Sweet } = require("../../src/models/sweet");

describe("Sweet Model", () => {
  test("should create a sweet with required fields", async () => {
    const sweet = new Sweet({
      name: "Gulab Jamun",
      category: "Dessert",
      price: 120,
      stock: 10,
    });
    const saved = await sweet.save();
    expect(saved._id).toBeDefined();
    expect(saved.name).toBe("Gulab Jamun");
    expect(saved.category).toBe("Dessert");
    expect(saved.price).toBe(120);
    expect(saved.stock).toBe(10);
    expect(saved.isAvailable).toBe(true);
    expect(saved.rating).toBe(0);
  });

  test("should fail without required fields", async () => {
    const sweet = new Sweet({});
    let error;
    try {
      await sweet.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.price).toBeDefined();
    // stock has a default value, so it's not required to be provided
  });

  test("should enforce price >= 0 and rating within bounds", async () => {
    const sweet = new Sweet({
      name: "Ladoo",
      category: "Snack",
      price: -10,
      stock: 5,
      rating: 6,
    });
    let error;
    try {
      await sweet.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.rating).toBeDefined();
  });
});
