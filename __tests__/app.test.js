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
