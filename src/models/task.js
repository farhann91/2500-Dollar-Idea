const mongoose = require("mongoose");

// Create a mongoose schema
const TaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

// Create a mongoose model
const Task = mongoose.model("task", TaskSchema);

// Export the module/model
module.exports = Task;
