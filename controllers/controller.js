const topics = require("../db/data/test-data/topics.js");
const endpointsJson = require("../endpoints.json");
const {
  selectTopics,
  selectArticleID,
  patchArticleVotes,
  fetchAllArticles,
  fetchArticleByTopic,
  fetchCommentsForArticle,
  insertComment,
  removeComment,
} = require("../models/model.js");

exports.getAllTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleID = (req, res, next) => {
  selectArticleID(req.params.article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  patchArticleVotes(req.body, req.params.article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const { order, sort_by, topic } = req.query;
  if (!!topic) {
    fetchArticleByTopic(order, sort_by, topic)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    fetchAllArticles(order, sort_by)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  }
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  fetchCommentsForArticle(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentOnArticle = (req, res, next) => {
  const { article_id } = req.params;
  const commentBody = req.body.body;
  const commentUsername = req.body.author;
  insertComment(article_id, commentBody, commentUsername)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  removeComment(req.params.comment_id)
    .then((rows) => {
      console.log(rows);
      res.status(204).send(rows);
    })
    .catch(next);
};

exports.getApi = (req, res, next) => {
  const response = { endpointsJson };
  res.status(200).send(response);
};
