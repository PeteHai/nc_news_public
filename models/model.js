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

exports.fetchAllArticles = () => {
  //query to get all article_id in an array
  //iterate through array, for each article_id do a query to get all the article info

  return db
    .query(
      `SELECT articles.*, COUNT(comment_id) AS comment_count
    FROM articles 
    LEFT JOIN comments 
    ON comments.article_id = articles.article_id
    GROUP BY articles.article_id;`
    )
    .then(({ rows }) => {
      //console.log(rows)
      return rows;
    });
};

//add into query ORDER BY ${sort_by} etc see mitch-treasures
