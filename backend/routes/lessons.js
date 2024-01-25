const express = require("express");
const router = express.Router();

router.get("/lessons", async (req, res) => {
  const db = req.db;
  try {
    const lessons = await db.collection("lessons").find({}).toArray();
    res.json(lessons);
  } catch (error) {
    res.status(500).send("Error fetching lessons.");
  }
});

module.exports = router;

router.put("/lessons/:id", async (req, res) => {
  const db = req.db;
  const lessonId = req.params.id;
  const update = { $inc: { availableInventory: -req.body.numberToDecrease } };

  try {
    const result = await db
      .collection("lessons")
      .updateOne({ _id: lessonId }, update);
    if (result.modifiedCount === 0)
      throw new Error("Lesson update failed or no changes made.");
    res.send("Lesson updated successfully.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});
