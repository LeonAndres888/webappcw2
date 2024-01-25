const express = require("express");
const router = express.Router();

router.post("/orders", async (req, res) => {
  const db = req.db;
  const order = req.body; // Make sure you have body-parser middleware to parse JSON body

  try {
    const result = await db.collection("orders").insertOne(order);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send("Error placing order.");
  }
});

module.exports = router;
