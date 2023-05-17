const express = require("express");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 9898;
const connect = require("./src/configurations/dbConnection");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const userRoute = require("./src/routes/user");
const taskRoute = require("./src/routes/task");

// Use Routes
app.use(userRoute);
app.use(taskRoute);

// Start the datase when the app starts
//  connect();

connect().then(() => {
  app.listen(PORT, () => {
    console.log("Server up and running on port: ", PORT);
  });
});
