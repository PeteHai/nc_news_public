const db = require("../db/connection.js");

exports.selectTopics = () => {
  const queryStr = `SELECT * FROM topics;`;

  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};
exports.selectArticleID = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comment_id) AS comment_count
      FROM articles 
      LEFT JOIN comments 
      ON comments.article_id = articles.article_id  
      WHERE articles.article_id = $1 
      GROUP BY articles.article_id;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else {
        return rows[0];
      }
    });
};

exports.patchArticleVotes = ({ inc_votes }, article_id) => {
  return db
    .query(
      `UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING articles.*;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.fetchAllArticles = (sortOrder = "ASC", sortProperty = "created_at") => {
  //input validation
  const orderWhitelist = ["asc", "desc"];
  const propertyWhitelist = ["title", "votes", "topic", "author", "created_at"];

  if (!propertyWhitelist.includes(sortProperty.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid Input" });
  }
  if (!orderWhitelist.includes(sortOrder.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid Input" });
  }

  //query construction
  const queryStr = `SELECT articles.*, COUNT(comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments 
    ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY ${sortProperty} ${sortOrder};`;

  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleByTopic = (
  sortOrder = "ASC",
  sortProperty = "created_at",
  topic
) => {
  const queryStr = `SELECT articles.*, 
  COUNT(comment_id) AS comment_count 
  FROM articles 
  LEFT JOIN comments ON comments.article_id = articles.article_id 
  WHERE articles.topic LIKE $1 
  GROUP BY articles.article_id 
  ORDER BY ${sortProperty} ${sortOrder};`;

  return db
    .query(queryStr, [topic])
    .then(({ rows }) => {
      return rows.length > 0
        ? rows
        : Promise.reject({ status: 404, msg: "Topic not found" });
    });
};

exports.fetchCommentsForArticle = (article_id) => {
  const queryStr = `
  SELECT * FROM comments
  WHERE article_id = $1`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows;
  });
};

exports.insertComment = (article_id, commentBody, commentUsername) =>{
  const queryStr = `
  INSERT INTO comments (body, votes, author, article_id, created_at)
  VALUES($1,$2,$3,$4, CURRENT_TIMESTAMP)`

  return db.query(queryStr, [commentBody, 0, commentUsername, article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows;
  });
}