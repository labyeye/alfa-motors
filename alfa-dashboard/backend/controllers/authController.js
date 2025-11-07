const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');

let User;
let USING_SQL_USER = false;
try {
  ({ User } = require('../models_sql/UserSQL'));
  USING_SQL_USER = true;
} catch (e) {
  User = require("../models/User");
}

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let user = null;
  if (USING_SQL_USER) {
    user = await User.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
      return;
    }
  } else {
    user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
      return;
    }
  }
  res.status(401);
  throw new Error("Invalid email or password");
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (USING_SQL_USER) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(400);
      throw new Error("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const created = await User.create({ name, email, password: hashed, role });
    if (created) {
      res.status(201).json({
        _id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        token: generateToken(created.id, created.role),
      });
      return;
    }
  } else {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    const user = await User.create({ name, email, password, role });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
      return;
    }
  }
  res.status(400);
  throw new Error("Invalid user data");
});

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });

module.exports = { loginUser, registerUser };
