const { Router } = require("express");
const loginRules = require("./middlewares/login-rules");
const bcrypt = require("bcrypt");
const UserModel = require("./users-model");
const { matchPassword } = require("../../shared/password-utils");
const usersRoute = Router();

// Login Route
usersRoute.post("/login", loginRules, async (req, res) => {
  try {
    const { username, password } = req.body;

    const foundUser = await UserModel.findOne({ username });
    if (!foundUser) {
      return res.status(404).send({
        errorMessage: `User with ${username} doesn't exist`,
      });
    }

    const passwordMatched = await matchPassword(password, foundUser.password);
    if (!passwordMatched) {
      return res.status(401).send({
        errorMessage: `Username and password didn't match`,
      });
    }

    const user = { ...foundUser.toJSON(), password: undefined };

    // Successful login response
    res.status(200).send({ user });
  } catch (err) {
    console.error(err);
    res.status(500).send({ errorMessage: "Internal server error" });
  }
});


// Get user by id Route
usersRoute.get("/accounts/:id", async (req, res) => {
  try {
    const userID = req.params.id;

    const foundUser = await UserModel.findById(userID);
    if (!foundUser) {
      return res
        .status(404)
        .send({ errorMessage: `User with ${userID} doesn't exist` });
    }

    const user = { ...foundUser.toJSON(), password: undefined };
    res.json(user);
  } catch (err) {
    res.status(400).send({ errorMessage: "Invalid user ID" });
  }
});

// Register Route
usersRoute.post("/register", async (req, res) => {
  const newUser = req.body;
  const existingUser = await UserModel.findOne({
    username: newUser.username,
  });
  if (existingUser) {
    return res.status(500).json({
      errorMessage: `User with ${newUser.username} already exist`,
    });
  }
  const addedUser = await UserModel.create(newUser);
  if (!addedUser) {
    return res.status(500).send({
      errorMessage: `Oops! User couldn't be added!`,
    });
  }
  const user = { ...addedUser.toJSON(), password: undefined };
  res.json(user);
});

module.exports = { usersRoute };
