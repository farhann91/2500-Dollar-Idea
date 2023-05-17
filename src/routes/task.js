const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const auth = require("../middlewares/auth");
const { check, validationResult } = require("express-validator");

// @route POST /tasks
// @desc Create a task
// @access private
router.post("/tasks", auth, async (req, res) => {
  const { text } = req.body;

  // Artificial error checking
  if (!text) {
    return res.status(400).json({ msg: "Task text is required" });
  }
  const task = new Task({ text, owner: req.user.id });
  await task.save();
  res.status(201).json({ task });
});

// @route GET /tasks
// @desc Fetch loggedIn User tasks
// @access private
router.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).select("-owner");
    if (!tasks) {
      return res.status(500).json({ errors: [{ msg: "Sorry try again" }] });
    }

    res.status(200).json(tasks);
  } catch (error) {}
});

// @route PUT /tasks/:task_id
// @desc Edit a task
// @access private
router.put(
  "/tasks/:task_id",
  [auth, check("text", "text is required").not().isEmpty()],
  async (req, res) => {
    const { text } = req.body;
    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors.array());
    }

    try {
      const task = await Task.findByIdAndUpdate(
        req.params.task_id,
        { text },
        { new: true }
      );
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// @route DELETE /tasks/:task_id
// @desc Delete a task
// @access private
router.delete("/tasks/:task_id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndRemove(req.params.task_id);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
