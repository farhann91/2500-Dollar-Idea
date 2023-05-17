const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const router = express.Router();
const User = require("../models/user");
const Task = require("../models/task");

// @route POST /users/register
// @desc Register a user
// @access public
router.post("/users/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(500).json({ msg: "User already exists." });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 8);
    user = new User({ name, email, password: hashedPassword });
    user.save();

    //   Generate token
    const payload = { user: { id: user._id } };
    jwt.sign(payload, process.env.SIRI, (err, token) => {
      if (err) throw err;

      res.status(201).json({ user, token });
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// @route POST /users/login
// @desc Login a user
// @access publi
router.post(
  "/users/login",
  [
    check("email", "emzil is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors.array());
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error_message: "Invalid credentials" });
      }

      // match the password
      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) {
        return res.status(400).json({ error_message: "Invalid credentials" });
      }

      // Create payload for jwt
      const payload = {
        user: { id: user._id },
      };

      // Create a token
      jwt.sign(payload, process.env.SIRI, (err, token) => {
        if (err) throw err;

        //  Create and send back token
        res.status(200).json({ token });
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
);

// @route POST /users/resetPassword
// @desc Reset a user password
// @access public
router.post("/users/resetPassword", async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(500)
        .json({ errors: [{ msg: "Sorry, email not found" }] });
    }

    // hash the password
    const temporaryPassword = "123456";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 8);
    // Find and update
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    // return new updated user
    if (updatedUser) {
      res
        .status(201)
        .json({ user: updatedUser, newPassword: temporaryPassword });
    }
  } catch (error) {
    return res.status(500).json({ error_message: error });
  }
});

// @route GET users/authenticate
// @desc Authenticate user
// @access private
router.get("/users/authenticate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ error_message: error.message });
  }
});

// @route DELETE /users
// @desc Delete the user and his tasks
// @access private
router.delete("/users", auth, async (req, res) => {
  try {
    // remove user's posts
    await Task.deleteMany({ owner: req.user.id });

    // Remove user
    await User.findByIdAndRemove(req.user.id);
    res.status(200).json({ msg: "User and tasks deleted succesfully" });
  } catch (error) {
    res.status(500).json({ error_message: "Server error" });
  }
});

module.exports = router;
