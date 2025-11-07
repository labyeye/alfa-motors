const { User } = require('../models_sql/UserSQL');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
  res.json(users);
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'staff',
  });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
    return;
  }
  res.status(400);
  throw new Error('Invalid user data');
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const updated = await user.update({
    name: req.body.name || user.name,
    email: req.body.email || user.email,
    role: req.body.role || user.role,
    status: req.body.status || user.status,
    ...(req.body.password ? { password: req.body.password } : {}),
  });
  res.json({
    _id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    status: updated.status,
    createdAt: updated.createdAt,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.destroy();
  res.json({ message: 'User removed' });
});

module.exports = { getUsers, createUser, updateUser, deleteUser };
