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

exports.patchArticleVotes = ({ inc_votes = 0 }, article_id) => {
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

exports.fetchAllArticles = (order = "DESC", sort_by = "created_at") => {
  //input validation
  const orderWhitelist = ["asc", "desc"];
  const propertyWhitelist = ["title", "votes", "topic", "author", "created_at"];

  if (!propertyWhitelist.includes(sort_by.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid Input" });
  }
  if (!orderWhitelist.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid Input" });
  }

  //query construction
  const queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, COUNT(comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments 
    ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleByTopic = (
  order = `DESC`,
  sort_by = "created_at",
  topic
) => {
  const queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, 
  COUNT(comment_id) AS comment_count 
  FROM articles 
  LEFT JOIN comments ON comments.article_id = articles.article_id 
  WHERE articles.topic LIKE $1 
  GROUP BY articles.article_id 
  ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr, [topic]).then(({ rows }) => {
    return rows;
  });
};

exports.fetchCommentsForArticle = (article_id) => {
  const queryStr = `
  SELECT * FROM comments
  WHERE article_id = $1`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "Article not found",
      });
    }
    return rows;
  });
};

exports.insertComment = (article_id, commentBody, commentUsername) => {
  const queryStr = `
  INSERT INTO comments(author, article_id, votes, created_at, body)
  VALUES($1,$2,$3,CURRENT_TIMESTAMP,$4) RETURNING *;`;

  return db
    .query(queryStr, [commentUsername, article_id, 0, commentBody])
    .catch((error) => {
      console.log(error);
      if (error.code === "23503") {
        return Promise.reject({ status: 404, msg: error.detail });
      } else if (error.code === "23502") {
        return Promise.reject({
          status: 400,
          msg: "Bad request - keys missing from POST request",
        });
      } else if (error.code === "22P02") {
        return Promise.reject({
          status: 400,
          msg: "Bad request - invalid ID type",
        });
      }
    })

    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else if (rows[0].body.length === 0) {
        return Promise.reject({
          status: 400,
          msg: "Bad request - body cannot be empty",
        });
      }
      return rows[0];
    });
};


exports.removeComment = (id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [id])
    .then(({ rows }) => {
      return rows[0];
    });
};