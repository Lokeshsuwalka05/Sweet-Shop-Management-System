const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const extractToken = (req) => {
  // Prefer cookie-based auth: httpOnly cookie named `token`
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  // Fallback to Authorization header if present (useful for tooling)
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
};

const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin };
