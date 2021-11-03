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
      "SELECT *, COUNT(comments_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = article.article_id GROUP BY article.article_id WHERE article_id = $1;",
      [article_id]
    )
    .then(({ rows }) => {
      console.log(rows);
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else {
        return rows[0];
      }
    });
};
