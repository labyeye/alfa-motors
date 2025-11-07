const express = require("express");
const router = express.Router();
const { loginUser, registerUser } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
let User;
let USING_SQL_USER = false;
try {
  ({ User } = require('../models_sql/UserSQL'));
  USING_SQL_USER = true;
} catch (e) {
  User = require("../models/User");
}
const jwt = require("jsonwebtoken");

router.post("/login", loginUser);
router.post("/register", protect, roleCheck(["admin"]), registerUser);

router.get("/me", authenticateToken, async (req, res) => {
  try {
    let user;
    if (USING_SQL_USER) {
      user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    } else {
      user = await User.findById(req.user.id).select("-password");
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = router;
