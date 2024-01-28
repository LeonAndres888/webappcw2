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
  const numberToDecrease = parseInt(req.body.numberToDecrease, 10);

  if (!ObjectId.isValid(lessonId)) {
    return res.status(400).send("Invalid lesson ID format.");
  }
  if (isNaN(numberToDecrease) || numberToDecrease <= 0) {
    return res
      .status(400)
      .send("Number to decrease must be a positive integer.");
  }

  try {
    const objectId = new ObjectId(lessonId);
    const updateResult = await db
      .collection("lessons")
      .updateOne(
        { _id: objectId, availableInventory: { $gte: numberToDecrease } },
        { $inc: { availableInventory: -numberToDecrease } }
      );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).send("Inventory update failed.");
    }
    res.json({ message: "Lesson updated successfully." });
  } catch (error) {
    res.status(500).send("Error updating lesson space.");
  }
});

module.exports = router;
