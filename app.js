const express = require("express");
const app = express();
app.use(express.json());

//happy path controllers
const {
  getAllTopics,
  getArticleID,
  patchArticle,
  getAllArticles,
  getArticleComments,
  postCommentOnArticle,
  deleteComment,
} = require("./controllers/controller.js");

//error handling controllers
const {
  handleDeleteError,
  handleCustomErrors,
  handlePsqlErrors,
  handle500Errors,
} = require("./controllers/error.controller.js");

//endpoints - could put these into a router?
app.get("/api/topics", getAllTopics);
app.get("/api/articles/:article_id", getArticleID);
app.patch("/api/articles/:article_id", patchArticle);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postCommentOnArticle);
app.delete("/api/comments/:comment_id", deleteComment);

//requests not allowed 405 handling
app.delete(() => {
  res.status(405).send({ msg: "method not allowed" });
});

//error handling middleware
app.all("*", (req, res) => {
  res.status(404).send({ msg: "Invalid path" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handle500Errors);

module.exports = app;
