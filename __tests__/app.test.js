const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed.js");
const request = require("supertest");
const app = require("../app.js");
const { post } = require("../app.js");
const articles = require("../db/data/test-data/articles.js");
const endpointsJson = require("../endpoints.json");

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
          expect(topics.length > 0).toBe(true);
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
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual(
            expect.objectContaining({
              article_id: 1,
              title: "Living in the shadow of a great man",
              body: "I find this existence challenging",
              votes: 100,
              topic: "mitch",
              author: "butter_bridge",
              created_at: expect.any(String),
              comment_count: "11",
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
      test("status 200 valid patch request with no information in body - sends unchanged article", () => {
        return request(app)
          .patch(`/api/articles/1`)
          .send({})
          .expect(200)
          .then(({ body }) => {
            expect(body.article).toEqual({
              article_id: 1,
              title: "Living in the shadow of a great man",
              body: "I find this existence challenging",
              votes: 100,
              topic: "mitch",
              author: "butter_bridge",
              created_at: expect.any(String),
            });
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
                votes: expect.any(Number),
                topic: expect.any(String),
                author: expect.any(String),
                created_at: expect.any(String),
              })
            );
          });
          expect(body["articles"].length > 0).toBe(true);
        });
    });

    test("status:200, articles are sorted by newest first by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body["articles"]).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("status:200, articles sort order can be defined by user query e.g. older first", () => {
      return request(app)
        .get("/api/articles?order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body["articles"]).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("status:200, user can define which property to sort by e.g. least votes", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).toBeSortedBy("votes", {
            ascending: true,
          });
        });
    });
    test("status:200, user can define which property to sort by e.g. author A-Z ACS", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).toBeSortedBy("author", {
            ascending: true,
          });
        });
    });
    test("status:200, user can define property and order to sort e.g. most votes first (votes DESC", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&sortOrder=desc")
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
  describe("sad path /api/articles", () => {});
  test.only("status:404 topic not found", () => {
    return request(app)
      .get(`/api/articles?topic=notAtopic`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid Topic");
      });
  });
  test("status:400,  Invalid sort order", () => {
    return request(app)
      .get(`/api/articles?order=banana`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid Input");
      });
  });
  test("status:400, Invalid property", () => {
    return request(app)
      .get(`/api/articles?sort_by=banana`)
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
        .then(({ body }) => {
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
          expect(body["comments"].length > 0).toBe(true);
        });
    });
    test("Status 200 and empty array when article exists but has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body["comments"]).toEqual([]);
        });
    });
  });
  describe("Sad Path for /api/articles/:article_id/comments", () => {
    test.only("status 200 and an empty array when article_id does not exist", () => {
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
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  describe("POST comment happy path", () => {
    test("Status 201 and responds with the newly created comment in an array", () => {
      const input = {
        author: "butter_bridge",
        body: "dogs are better than cats",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(input)
        .expect(201)
        .then(({ body }) => {
          expect(body).toEqual({
            comment: {
              comment_id: expect.any(Number),
              author: "butter_bridge",
              article_id: 1,
              votes: 0,
              created_at: expect.any(String),
              body: "dogs are better than cats",
            },
          });
        });
    });
  });
  describe("POST comment SAD path", () => {
    test("status 400 and bad request message when comment body is empty", () => {
      const input = {
        author: "butter_bridge",
        body: "",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual("Bad request - body cannot be empty");
        });
    });
    test("status 400, invalid ID e.g. a string", () => {
      const input = {
        author: "butter_bridge",
        body: "testing for an invalid article_id",
      };
      return request(app)
        .post("/api/articles/reallyBadId/comments")
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual("Bad request - invalid ID type");
        });
    });
    test("status 404, article not found when trying to post a comment on an valid article that does not exist", () => {
      const input = {
        author: "butter_bridge",
        body: "testing for a valid article_id that doesnot exist",
      };
      return request(app)
        .post("/api/articles/999/comments")
        .send(input)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual(
            'Key (article_id)=(999) is not present in table "articles".'
          );
        });
    });
    test("status 400 and bad request message when post does not include all the required keys", () => {
      const input = {
        body: "testing for a post that does not include all keys",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual(
            "Bad request - keys missing from POST request"
          );
        });
    });
    test("status 404, username does not exist", () => {
      const input = {
        author: "really_terrible_userName",
        body: "testing for an invalid username",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(input)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual(
            `Key (author)=(really_terrible_userName) is not present in table "users".`
          );
        });
    });
    test("status 201,ignores unnecessary properties", () => {
      const input = {
        author: "butter_bridge",
        body: "please ignore this next property",
        votes: 2000,
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(input)
        .expect(201)
        .then(({ body }) => {
          expect(body).toEqual({
            comment: {
              comment_id: expect.any(Number),
              author: "butter_bridge",
              article_id: 1,
              votes: 0,
              created_at: expect.any(String),
              body: "please ignore this next property",
            },
          });
        });
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("status 204 and no content", () => {
      return request(app).delete("/api/comments/3").expect(204);
    });
  });
  describe("DELETE sad path", () => {
    test("status:400 and invalid commentId message", () => {
      return request(app)
        .delete(`/api/comments/badId`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid query");
        });
    });
    test("Status 404 - valid comment_id that does not exist", () => {
      return request(app)
        .delete("/api/articles/2/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid path");
        });
    });
  });
});

describe("GET /api", () => {
  describe("GET /api Happy Path", () => {
    test("status 200 and JSON object", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              endpointsJson,
            })
          );
        });
    });
  });
});
