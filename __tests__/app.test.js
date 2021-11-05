const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed.js");
const request = require("supertest");
const app = require("../app.js");
const { post } = require("../app.js");
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
          expect(body.article).toEqual(
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
            expect(body.article).toEqual({
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
      test("status:400, query is invalid", () => {
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

describe("/api/articles", () => {
  describe("GET", () => {
    test("status 200 and responds with an array of article objects with the relevant properties", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          body["articles"].forEach((article) => {
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
            );
          });
        });
    });

    test("status:200, articles are sorted by newest first by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", { ascending: false });
        });
    });
    test("status:200, articles sort order can be defined by user query e.g. older first", () => {
      return request(app)
        .get("/api/articles?sortOrder=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("status:200, user can define which property to sort by e.g. least votes", () => {
      return request(app)
        .get("/api/articles?sortProperty=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("votes", {
            ascending: true,
          });
        });
    });
    test("status:200, user can define which property to sort by e.g. author A-Z ACS", () => {
      return request(app)
        .get("/api/articles?sortProperty=author")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("author", {
            ascending: true,
          });
        });
    });
    test("status:200, user can define property and order to sort e.g. most votes first (votes DESC", () => {
      return request(app)
        .get("/api/articles?sortProperty=votes&sortOrder=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("votes", {
            descending: true,
          });
        });
    });
    test("status:200, user can get properties by topic", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const intended = articles.every(
            (article) => article.topic === "cats"
          );
          expect(intended).toEqual(true);
        });
    });
  });
  describe("sad path /api/articles", () => {
  });
  test("status:404, not a valid topic", () => {
    return request(app)
      .get(`/api/articles?topic=notAtopic`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Topic not found");
      });
  });
  test("status:400,  Invalid sort order", () => {
    return request(app)
      .get(`/api/articles?sortOrder=banana`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid Input");
      });
  });
  test("status:400, Invalid property", () => {
    return request(app)
      .get(`/api/articles?sortProperty=banana`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid Input");
      });
  });
});
describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("Status 200 and an array of comments for the given article_id", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({body}) => {
          body["comments"].forEach((comment) => {
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
              })
            );
          });
        });
    });
  });
  describe('Sad Path for /api/articles/:article_id/comments',()=>{
    test("status:404, article_id is valid but does not exist", () => {
      return request(app)
        .get(`/api/articles/9999/comments`)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual("Article not found");
        });
    });
    test("status:400, article_id is invalid", () => {
      return request(app)
        .get(`/api/articles/bad_id/comments`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual("Invalid query");
        });
    });

  })
  describe('POST /api/articles/:article_id/comments',()=>{
    test('Status 201 and responds with the newly created comment',()=>{
      const input ={
        username: "bob",
        body:"dogs are better than cats"
      }
      return request(app)
      .post("/api/articles/1/comments")
      .send(input)
      .expect(201)
      .then(({body})=>{
        expect(body[0].toEqual({
          comment_id: expect.any(Number),
          ...input
        }))
      })
    })
  })
});

// describe('/api/comments/:comment_id',()=>{
//   describe('DELETE',()=>{
//     test('')
//   })
// })