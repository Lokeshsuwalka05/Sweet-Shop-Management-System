const express = require("express");
const { Sweet } = require("../models/sweet");
const { requireAdmin } = require("../middlewares/auth");

const sweetsRouter = express.Router();

const validateCreateSweet = (data) => {
  const { name, category, price, stock } = data;
  if (!name || !category || price === undefined || stock === undefined) {
    throw new Error("Missing required fields");
  }
  if (typeof price !== "number" || price < 0) {
    throw new Error("Invalid price");
  }
  if (typeof stock !== "number" || stock < 0) {
    throw new Error("Invalid stock");
  }
};

sweetsRouter.post("/api/sweets", requireAdmin, async (req, res) => {
  try {
    validateCreateSweet(req.body);
    const sweet = new Sweet(req.body);
    await sweet.save();

    const safe = {
      _id: sweet._id,
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      stock: sweet.stock,
      description: sweet.description,
      ingredients: sweet.ingredients,
      imageUrl: sweet.imageUrl,
      isAvailable: sweet.isAvailable,
      rating: sweet.rating,
      createdAt: sweet.createdAt,
      updatedAt: sweet.updatedAt,
    };

    res.status(201).json({ message: "Sweet created", sweet: safe });
  } catch (e) {
    const message = e && e.message ? e.message : "Creation failed";
    res.status(400).json({ error: message });
  }
});

module.exports = { sweetsRouter };
