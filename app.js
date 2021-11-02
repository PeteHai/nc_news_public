const express = require("express");
const app = express();
app.use(express.json());

//happy path controllers
const {getAllTopics,getArticleID} = require("./controllers/controller.js");

//error handling controllers
const {handle404BadPath} = require("./controllers/error.controller.js");




//endpoints
app.get("/api/topics",getAllTopics);
app.get('/api/articles/:article_id',getArticleID);

//error handling middleware

app.all("*", (req, res) => {
    res.status(404).send({ msg: "Invalid path" });
  });


  
module.exports = app;
