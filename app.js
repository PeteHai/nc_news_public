const express = require("express");
const app = express();
app.use(express.json());

//happy path controllers
const {getAllTopics} = require("./controllers/controller.js");

//error handling controllers
const {handle404BadPath} = require("./controllers/error.controller.js");




//endpoints
app.get("/api/topics",getAllTopics);

//error handling middleware
app.use(handle404BadPath) //cannot seem to get into there?

//could use the below to send the invalid URL error code
app.all("*", (req, res) => {
    res.status(404).send({ msg: "invalid url" });
  });
  
module.exports = app;
