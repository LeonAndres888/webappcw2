const express = require("express");
const router = express.Router();

// GET route for fetching all orders
router.get("/", async (req, res) => {
  const db = req.db;
  try {
    const orders = await db.collection("orders").find({}).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).send("Error fetching orders.");
  }
});

// POST route for creating a new order
router.post("/", async (req, res) => {
  const db = req.db;
  const order = req.body; // Ensure body-parser middleware is used

  try {
    const result = await db.collection("orders").insertOne(order);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send("Error placing order.");
  }
});

module.exports = router;
