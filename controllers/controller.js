const topics = require("../db/data/test-data/topics.js");
const {
  selectTopics,
  selectArticleID,
  patchArticleVotes,
  fetchAllArticles,
  fetchArticleByTopic,
  fetchCommentsForArticle,
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
    .then((rows) => {
      res.status(200).send(rows);
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  patchArticleVotes(req.body, req.params.article_id) //{ inc_votes: 10 }
    .then((patchedArticle) => {
      res.status(200).send({ patchedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const { sortOrder, sortProperty, topic } = req.query;

  if (!!topic) {
    fetchArticleByTopic(sortOrder, sortProperty, topic)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    fetchAllArticles(sortOrder, sortProperty)
      .then((articlesArray) => {
        res.status(200).send(articlesArray);
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
      res.status(200).send(comments);
    })
    .catch((err) => {
      next(err);
    });
};
