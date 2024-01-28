const express = require("express");
const router = express.Router();

// Route to fetch all orders from database
// Sends JSON response with an array of all order objects
router.get("/", async (req, res) => {
  const db = req.db; // Obtain database connection from request object

  try {
    // Retrieve all orders from 'orders' collection and convert to an array
    const orders = await db.collection("orders").find({}).toArray();
    res.json(orders); // Send array of orders as a JSON response
  } catch (error) {
    // Log error to console
    console.error("Error fetching orders:", error);
    // Send Internal Server Error response
    res.status(500).send("Error fetching orders.");
  }
});

// Route to create a new order
// Order data is expected to be in request body
router.post("/", async (req, res) => {
  const db = req.db; // Obtain database connection from request object
  const order = req.body; // Access order data from request body

  try {
    // Insert new order into 'orders' collection
    const result = await db.collection("orders").insertOne(order);
    // If successful, send back result of the insert operation with a 201 Created status
    res.status(201).json(result);
  } catch (error) {
    // Log error to console
    console.error("Error placing order:", error);
    // Send Internal Server Error response
    res.status(500).send("Error placing order.");
  }
});

// Export router to make it available for import in main server file
module.exports = router;
