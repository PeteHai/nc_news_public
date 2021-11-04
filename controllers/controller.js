const topics = require("../db/data/test-data/topics.js");
const {
  selectTopics,
  selectArticleID,
  patchArticleVotes,
  fetchAllArticles,
  fetchArticleByTopic,
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
    fetchArticleByTopic(topic)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    fetchAllArticles(sortOrder, sortProperty, topic)
      .then((articlesArray) => {
        res.status(200).send(articlesArray);
      })
      .catch((err) => {
        next(err);
      });
  }
};
