const jwt = require("jsonwebtoken");
let User;
let USING_SQL_USER = false;
try {
  ({ User } = require('../models_sql/UserSQL'));
  USING_SQL_USER = true;
} catch (e) {
  User = require("../models/User");
}

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // decoded contains { id, role }
      if (USING_SQL_USER) {
        const u = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
        req.user = u ? { id: u.id, role: u.role, name: u.name } : { id: decoded.id, role: decoded.role };
      } else {
        req.user = await User.findById(decoded.id).select("-password");
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, admin };
