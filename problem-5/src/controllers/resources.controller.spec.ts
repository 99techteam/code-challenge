import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import resourcesRouter from "../routes/resources.route";
import {
  RESOURCE_COLLECTION,
  ResourceEntity
} from "../cores/entities/resource.entity";

let app: express.Application;
let mongod: MongoMemoryServer;

const mockResource = { name: "Test Resource" };
const mockFilterName = "Test";

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  app = express();
  app.use(express.json());
  app.use("/resources", resourcesRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe("Resource Controller Integration", () => {
  describe("#POST /resources", () => {
    describe("When valid data", () => {
      it("Should store resource", async () => {
        const res = await request(app)
          .post("/resources")
          .send(mockResource)
          .expect(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body.name).toBe(mockResource.name);

        // Make sure resource has been created
        const afterCreateResource = await mongoose.connection.db
          .collection(RESOURCE_COLLECTION)
          .findOne({});
        // Log the list of collections
        expect(afterCreateResource).not.toBeNull();
        expect(afterCreateResource!.name).toEqual(mockResource.name);
      });
    });

    describe("When given invalid data", () => {
      const invalidDataCases = [
        {
          description: "When name is empty string",
          value: "",
          expectedCode: 400,
          expectedMessage: "Validation failed"
        },
        {
          description: "When name is too long",
          value: "a".repeat(101),
          expectedCode: 400,
          expectedMessage: "Validation failed"
        },
        {
          description: "When name is not a string",
          value: 123,
          expectedCode: 400,
          expectedMessage: "Validation failed"
        }
      ];

      invalidDataCases.forEach(
        ({ description, value, expectedCode, expectedMessage }) => {
          describe(description, () => {
            it("Should return 400", async () => {
              const res = await request(app)
                .post("/resources")
                .send({ name: value })
                .expect(expectedCode);

              expect(res.body.message).toBe(expectedMessage);
              expect(res.body.errors).toBeDefined();
              expect(res.body.errors.length).toBeGreaterThan(0);
            });
          });
        }
      );
    });
  });

  describe("#GET /resources", () => {
    describe("When not apply filter by name", () => {
      it("should respond all resources", async () => {
        await request(app).post("/resources").send(mockResource);
        const res = await request(app).get("/resources").expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
    });

    describe("When apply filter by name", () => {
      it("should respond only resources' name match the filter", async () => {
        await request(app).post("/resources").send({
          name: "Name 1"
        });
        await request(app).post("/resources").send({
          name: "Name 2"
        });
        const res = await request(app)
          .get("/resources")
          .query({
            name: "1"
          })
          .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Name 1");
      });
    });
  });

  describe("#GET /resources/:id", () => {
    describe("When resource exists", () => {
      it("should respond resource", async () => {
        const createRes = await request(app)
          .post("/resources")
          .send(mockResource);
        const id = createRes.body._id;
        const res = await request(app).get(`/resources/${id}`).expect(200);
      });

      describe("When resource not exists", () => {
        it("should respond 404", async () => {
          const res = await request(app)
            .get(`/resources/${new mongoose.Types.ObjectId().toString()}`)
            .expect(404);
        });
      });
    });
  });

  describe("#PUT /resources/:id", () => {
    describe("When resource exists", () => {
      describe("When valid data", () => {
        it("should update resource", async () => {
          const createRes = await request(app)
            .post("/resources")
            .send(mockResource);
          const id = createRes.body._id;
          const update = { name: "Updated Resource" };
          const res = await request(app)
            .put(`/resources/${id}`)
            .send(update)
            .expect(200);
          expect(res.body.name).toBe(update.name);
        });

        it("should update resource with empty body", async () => {
          const createRes = await request(app)
            .post("/resources")
            .send(mockResource);
          const id = createRes.body._id;
          const res = await request(app)
            .put(`/resources/${id}`)
            .send({})
            .expect(200);
          expect(res.body.name).toBe(mockResource.name);
        });
      });

      describe("When given invalid body", () => {
        const invalidDataCases = [
          {
            description: "When name is empty string",
            value: "",
            expectedCode: 400,
            expectedMessage: "Validation failed"
          },
          {
            description: "When name is too long",
            value: "a".repeat(101),
            expectedCode: 400,
            expectedMessage: "Validation failed"
          },
          {
            description: "When name is not a string",
            value: 123,
            expectedCode: 400,
            expectedMessage: "Validation failed"
          }
        ];

        invalidDataCases.forEach(
          ({ description, value, expectedCode, expectedMessage }) => {
            describe(description, () => {
              it("Should return 400", async () => {
                const createRes = await request(app)
                  .post("/resources")
                  .send(mockResource);
                const id = createRes.body._id;
                const res = await request(app)
                  .put(`/resources/${id}`)
                  .send({ name: value })
                  .expect(expectedCode);
                expect(res.body.message).toBe(expectedMessage);
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors.length).toBeGreaterThan(0);
              });
            });
          }
        );
      });
    });

    describe("When resource not exists", () => {
      it("should respond 404", async () => {
        const res = await request(app)
          .put(`/resources/${new mongoose.Types.ObjectId().toString()}`)
          .expect(404);
        expect(res.body.message).toBe("Resource not found");
      });
    });
  });

  describe("#DELETE /resources/:id", () => {
    describe("When resource exists", () => {
      it("should delete resource", async () => {
        const createRes = await request(app)
          .post("/resources")
          .send(mockResource);
        const id = createRes.body._id;
        const res = await request(app).delete(`/resources/${id}`).expect(204);
      });

      describe("When resource not exists", () => {
        it("should respond 404", async () => {
          const res = await request(app)
            .delete(`/resources/${new mongoose.Types.ObjectId().toString()}`)
            .expect(404);
          expect(res.body.message).toBe("Resource not found");
        });
      });
    });
  });
});
