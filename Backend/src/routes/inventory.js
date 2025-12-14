const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { Sweet } = require("../models/sweet");

const inventoryRouter = express.Router();

inventoryRouter.post("/api/sweets/:id/purchase", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid sweet ID format" });
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

    if (sweet.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    sweet.stock -= quantity;
    // Optionally update availability
    if (sweet.stock === 0) {
      sweet.isAvailable = false;
    }
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

    res.status(200).json({ message: "Purchase successful", sweet: safe });
  } catch (e) {
    const message = e && e.message ? e.message : "Purchase failed";
    res.status(400).json({ error: message });
  }
});

module.exports = { inventoryRouter };
