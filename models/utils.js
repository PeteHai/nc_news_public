const db = require("../db/connection.js");

exports.articlesIdCheck = (article_id) => {
  const queryIDcheck = `
    SELECT * FROM articles WHERE article_id = $1;`;
  return db.query(queryIDcheck, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      console.log("1", rows);
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
  });
};
