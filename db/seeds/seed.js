const format = require("pg-format");
const db = require("../connection.js");

const seed = (data) => {
  const { articleData, commentData, topicData, userData } = data;
  return (
    db
      .query(`DROP TABLE IF EXISTS comments;`)
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS articles;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS users;`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS topics;`);
      })
      // 1. create tables
      .then(() => {
        return db.query(`
    CREATE TABLE topics (
      slug TEXT NOT NULL PRIMARY KEY,
      description TEXT NOT NULL
    );`);
      })
      .then(() => {
        return db.query(`
    CREATE TABLE users (
      username TEXT NOT NULL PRIMARY KEY,
      avatar_url TEXT NOT NULL,
      name TEXT NOT NULL
    );`);
      })
      .then(() => {
        return db.query(`
    CREATE TABLE articles (
      article_id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      votes INT NOT NULL  DEFAULT 0,
      topic TEXT NOT NULL,
      FOREIGN KEY (topic) REFERENCES topics(slug),
      author TEXT NOT NULL,
      FOREIGN KEY(author) REFERENCES users(username),
      created_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP );`);
      })
      .then(() => {
        return db.query(`
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        author TEXT NOT NULL,
        FOREIGN KEY(author) REFERENCES users(username),
        article_id INT,
        FOREIGN KEY(article_id) REFERENCES articles(article_id),
        votes INT DEFAULT 0,
        created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
        body TEXT NOT NULL
          );`);
      })
      // 2. insert data
      .then(() => {
        const topicQueryStr = format(
          `
            INSERT INTO topics
            (slug, description)
            VALUES
            %L RETURNING*`,
          topicData.map((topic) => {
            return [topic.slug, topic.description];
          })
        );
        return db.query(topicQueryStr);
      })
      .then(() => {
        const usersQueryStr = format(
          `
            INSERT INTO users
            (username, avatar_url, name)
            VALUES
            %L RETURNING*`,
          userData.map((user) => {
            return [user.username, user.avatar_url, user.name];
          })
        );
        return db.query(usersQueryStr);
      })
      .then(() => {
        const articleQueryStr = format(
          `
            INSERT INTO articles
            (title, body, topic, author, votes, created_at)
            VALUES
            %L RETURNING*`,
          articleData.map((article) => {
            return [
              article.title,
              article.body,
              article.topic,
              article.author,
              article.votes,
              article.created_at,
            ];
          })
        );
        return db.query(articleQueryStr);
      })
      .then(() => {
        const commentQueryStr = format(
          `
            INSERT INTO comments
            (author, article_id, votes, created_at, body)
            VALUES
            %L RETURNING*`,
          commentData.map((comment) => {
            return [
              comment.author,
              comment.article_id,
              comment.votes,
              comment.created_at,
              comment.body,
            ];
          })
        );
        return db.query(commentQueryStr);
      })
  );
};

module.exports = { seed };
