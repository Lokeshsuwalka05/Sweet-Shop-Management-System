const express = require("express");
const { Sweet } = require("../models/sweet");
const { requireAdmin, requireAuth } = require("../middlewares/auth");

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

sweetsRouter.get("/api/sweets/search", requireAuth, async (req, res) => {
  try {
    const { name, category, priceMin, priceMax } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) {
        filter.price.$gte = Number(priceMin);
      }
      if (priceMax !== undefined) {
        filter.price.$lte = Number(priceMax);
      }
    }

    const sweets = await Sweet.find(filter);

    const safeSweets = sweets.map((sweet) => ({
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
    }));

    res.status(200).json({ sweets: safeSweets });
  } catch (e) {
    const message = e && e.message ? e.message : "Search failed";
    res.status(500).json({ error: message });
  }
});

sweetsRouter.get("/api/sweets", requireAuth, async (req, res) => {
  try {
    const sweets = await Sweet.find({});

    const safeSweets = sweets.map((sweet) => ({
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
    }));

    res.status(200).json({ sweets: safeSweets });
  } catch (e) {
    const message = e && e.message ? e.message : "Failed to fetch sweets";
    res.status(500).json({ error: message });
  }
});

sweetsRouter.get("/api/sweets/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid sweet ID format" });
    }

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

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

    res.status(200).json(safe);
  } catch (e) {
    const message = e && e.message ? e.message : "Failed to fetch sweet";
    res.status(500).json({ error: message });
  }
});

sweetsRouter.put("/api/sweets/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid sweet ID format" });
    }

    const updateData = req.body;

    // Validate fields if provided
    if (updateData.price !== undefined) {
      if (typeof updateData.price !== "number" || updateData.price < 0) {
        return res.status(400).json({ error: "Invalid price" });
      }
    }

    if (updateData.stock !== undefined) {
      if (typeof updateData.stock !== "number" || updateData.stock < 0) {
        return res.status(400).json({ error: "Invalid stock" });
      }
    }

    const sweet = await Sweet.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

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

    res.status(200).json({ message: "Sweet updated", sweet: safe });
  } catch (e) {
    const message = e && e.message ? e.message : "Update failed";
    res.status(400).json({ error: message });
  }
});

sweetsRouter.delete("/api/sweets/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid sweet ID format" });
    }

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      return res.status(404).json({ error: "Sweet not found" });
    }

    res.status(200).json({ message: "Sweet deleted successfully" });
  } catch (e) {
    const message = e && e.message ? e.message : "Delete failed";
    res.status(400).json({ error: message });
  }
});

module.exports = { sweetsRouter };
