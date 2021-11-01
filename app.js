const express = require("express");
const app = express();
app.use(express.json());
const {getAllTopics} = require("./controllers/controller.js");



//endpoints
app.get("/api/topics",getAllTopics);

module.exports = app;
