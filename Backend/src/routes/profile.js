const profileRouter = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
profileRouter.get("/api/user", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, emailId, role, createdAt, updatedAt, _id } =
      req.user;
    const user = {
      _id,
      firstName,
      lastName,
      emailId,
      role,
      createdAt,
      updatedAt,
    };
    res.status(200).json(user);
  } catch (e) {
    const message = e && e.message ? e.message : "Failed to fetch user";
    res.status(500).json({ error: message });
  }
});
module.exports = { profileRouter };
