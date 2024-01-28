const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

// GET route, fetches all lessons from database
// Responds with an array of lesson objects in JSON
router.get("/", async (req, res) => {
  // Set headers to prevent caching of response
  res.set("Cache-Control", "no-store");
  const db = req.db; // Acquire database connection from request object

  try {
    // Fetch all documents from 'lessons' collection and convert to array
    const lessons = await db.collection("lessons").find({}).toArray();
    res.json(lessons); // Send lessons back in the response
  } catch (error) {
    // Log error to server console and send an error response
    console.error("Error fetching lessons:", error);
    res.status(500).send("Error fetching lessons.");
  }
});

// PUT route for updating available space in a lesson
// Decreases availableInventory by the number provided in the request body
router.put("/:id", async (req, res) => {
  const db = req.db; // Acquire database connection from request object
  const lessonId = req.params.id; // Get lesson ID from URL parameters
  const numberToDecrease = parseInt(req.body.numberToDecrease, 10); // Parse the decrease number from request body

  // Validate the provided lesson ID
  if (!ObjectId.isValid(lessonId)) {
    return res.status(400).send("Invalid lesson ID format.");
  }

  // Validate number to decrease is a positive integer
  if (isNaN(numberToDecrease) || numberToDecrease <= 0) {
    return res
      .status(400)
      .send("Number to decrease must be a positive integer.");
  }

  try {
    // Create an ObjectId instance for lessonId
    const objectId = new ObjectId(lessonId);
    // Attempt to update specified lesson's availableInventory
    const updateResult = await db
      .collection("lessons")
      .updateOne(
        { _id: objectId, availableInventory: { $gte: numberToDecrease } },
        { $inc: { availableInventory: -numberToDecrease } }
      );

    // Check if update operation modified any documents
    if (updateResult.modifiedCount === 0) {
      // If no documents modified, perhaps the lesson doesn't exist or inventory is insufficient
      return res
        .status(400)
        .send("Inventory update failed or lesson not found.");
    }

    // If update is successful, send success response
    res.json({
      message: "Lesson updated successfully.",
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    // If error, log and send error response
    console.error("Error updating lesson:", error);
    res.status(500).send("Error updating lesson space.");
  }
});

// Export router for use in the main server file
module.exports = router;
