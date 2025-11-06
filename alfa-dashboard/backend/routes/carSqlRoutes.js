const express = require("express");
const router = express.Router();
const { Car } = require("../models_sql/CarSQL");

// GET /api/cars-sql  -> list all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.findAll();
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/cars-sql/:id -> get single car
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cars-sql -> create new car
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const created = await Car.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

// PUT /api/cars-sql/:id -> update car
router.put("/:id", async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    await car.update(req.body);
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

// DELETE /api/cars-sql/:id -> delete car
router.delete("/:id", async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    await car.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
