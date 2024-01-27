const express = require("express");
const { ObjectId } = require("mongodb"); // Import ObjectId for MongoDB
const router = express.Router();

// GET route for fetching all lessons
router.get("/", async (req, res) => {
  const db = req.db;
  try {
    const lessons = await db.collection("lessons").find({}).toArray();
    res.json(lessons);
  } catch (error) {
    res.status(500).send("Error fetching lessons.");
  }
});

// PUT route for updating a specific lesson's available space
router.put("/:id", async (req, res) => {
  const db = req.db;
  const lessonId = new ObjectId(req.params.id); // Convert to ObjectId
  const update = { $inc: { availableInventory: -req.body.numberToDecrease } };

  try {
    const result = await db
      .collection("lessons")
      .updateOne({ _id: lessonId }, update);
    if (result.modifiedCount === 0) {
      throw new Error("Lesson update failed or no changes made.");
    }
    res.send("Lesson updated successfully.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
