require('dotenv').config();

const express = require("express");
const { progressRoute } = require("./modules/progress/progress-routes");
const { usersRoute } = require("./modules/users/users-routes");
const connectDB = require("./shared/middlewares/connect-db");
const cors = require("cors");
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const port = 3000;
const hostname = "0.0.0.0";
const server = express();

server.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(connectDB)
server.use("/progress", progressRoute);
server.use("/users", usersRoute);

server.use((error, req, res, next) => {
  console.log(error);
  res.status(500).send("Oops! Internal server error!");
});

server.use((req, res, next) => {
  res.status(404).send(`404! ${req.method} ${req.path} Not Found.`);
});

server.listen(port, hostname, (error) => {
  if (error) console.log(error.message);
  else console.log(`Server running on http://${hostname}:${port}`);
});
s