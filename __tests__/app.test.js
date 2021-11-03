const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed.js");
const request = require("supertest");
const app = require("../app.js");
process.env.NODE_ENV = "test";

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/topics", () => {
  describe("GET", () => {
    test("it returns all topics currently available from topics table", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          topics.forEach((topic) => {
            expect(topic).toEqual(
              expect.objectContaining({
                slug: expect.any(String),
                description: expect.any(String),
              })
            );
          });
        });
    });
  });
  describe("/api/topics sad path error handling", () => {
    test("status:404, returns an error when using an invalid path", () => {
      return request(app)
        .get("/api/wrongPath")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual("Invalid path");
        });
    });
  });
});
describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("status:200 and returns article data for relevant id", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              body: expect.any(String),
              votes: expect.any(Number),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              comment_count: expect.any(String),
            })
          );
        });
    });
  });
  describe("sad path article_id not found", () => {
    test("status:404, article_id is valid but does not exist", () => {
      const idOfArticle = 9999;
      return request(app)
        .get(`/api/articles/${idOfArticle}`)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual("Article not found");
        });
    });
  });
  describe("sad path invalid article_id request", () => {
    test("status:400, returns an error when using an invalid path format", () => {
      const idOfArticle = "bad_id";
      return request(app)
        .get(`/api/articles/${idOfArticle}`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual("Invalid query");
        });
    });
  });

  describe("/api/articles/:article_id", () => {
    describe("PATCH", () => {
      test("status:200 and responds with the updated article object", () => {
        const idOfArticle = 1;
        const newVote = 10;
        return request(app)
          .patch(`/api/articles/${idOfArticle}`)
          .send({ inc_votes: newVote })
          .expect(200)
          .then(({ body }) => {
            expect(body.patchedArticle).toEqual({
              article_id: 1,
              title: "Living in the shadow of a great man",
              body: "I find this existence challenging",
              votes: 110, //expect old #votes +- vote inc
              topic: "mitch",
              author: "butter_bridge",
              created_at: expect.any(String),
            });
          });
      });
    });
    describe("PATCH SAD PATH", () => {
      test("status:404, article_id is valid but does not exist", () => {
        return request(app)
          .patch(`/api/articles/9999`)
          .send({ inc_votes: 10 })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toEqual("Article not found");
          });
      });
      test("status:400, article_id is invalid", () => {
        return request(app)
          .patch(`/api/articles/bad_id`)
          .send({ inc_votes: 10 })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toEqual("Invalid query");
          });
      });
      test("status:400, SQL query is invalid", () => {
        return request(app)
          .patch(`/api/articles/1`)
          .send({ inc_votes: "bad_request" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toEqual("Invalid query");
          });
      });
    });
  });
});

describe.only("/api/articles", () => {
  describe("GET", () => {
    test("status 200 and responds with an array of article objects with the relevant properties", () => {
      return request(app)
      .get('/api/articles')
        .expect(200)
        .then(({body}) => {
          console.log(body)
          body.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
              article_id: expect.any(Number), 
              title: expect.any(String),
              body: expect.any(String),
              votes: expect.any(Number), 
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
            })
          )});
        });
    });
  });
});
