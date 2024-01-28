const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

// GET route for fetching all lessons
router.get("/", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const db = req.db;
  try {
    const lessons = await db.collection("lessons").find({}).toArray();
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error); // Log error on server
    res.status(500).send("Error fetching lessons.");
  }
});

router.put("/:id", async (req, res) => {
  const db = req.db;
  const lessonId = req.params.id;

  // Validate lessonId is a valid ObjectId
  if (!ObjectId.isValid(lessonId)) {
    return res.status(400).send("Invalid lesson ID format.");
  }

  const objectId = new ObjectId(lessonId); // Convert to ObjectId
  const numberToDecrease = parseInt(req.body.numberToDecrease, 10); // Ensure it's an integer

  // Check that numberToDecrease is 1
  if (numberToDecrease !== 1) {
    return res.status(400).send("Number to decrease must be 1.");
  }

  try {
    // Check the current inventory before decrementing
    const currentLesson = await db
      .collection("lessons")
      .findOne({ _id: objectId });
    if (!currentLesson) {
      return res.status(404).send("Lesson not found.");
    }

    if (currentLesson.availableInventory < numberToDecrease) {
      return res.status(400).send("Not enough spaces available to decrease.");
    }

    // Proceed with the update if the check passes
    const update = { $inc: { availableInventory: -numberToDecrease } };
    const result = await db
      .collection("lessons")
      .updateOne({ _id: objectId }, update);

    if (result.modifiedCount === 0) {
      return res
        .status(400)
        .send(
          "No update made. It's possible the number to decrease was not a positive number or exceeded the available inventory."
        );
    }

    res.json({ message: "Lesson updated successfully." });
  } catch (error) {
    console.error(`Error updating lesson space: ${error}`);
    res.status(500).send("Error updating lesson space.");
  }
});

module.exports = router;
