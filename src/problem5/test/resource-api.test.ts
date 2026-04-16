import assert from "node:assert/strict";
import test from "node:test";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import { createApp } from "../src/app.js";

const authToken = "test-token";

test("resource API enforces auth and supports CRUD flows", async () => {
  const mongoServer = await MongoMemoryServer.create();

  try {
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.AUTH_TOKEN = authToken;

    await mongoose.connect(process.env.MONGODB_URI);

    const app = createApp();
    const agent = request(app);

    await agent.get("/resources").expect(401);

    const createResponse = await agent
      .post("/resources")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Test Resource",
        value: "xxxxx",
        description: "A test resource",
        status: 1,
        detail: {
          scope: "integration-test"
        }
      })
      .expect(201);

    assert.equal(createResponse.body.success, true);
    assert.equal(createResponse.body.data.name, "Test Resource");
    assert.ok(createResponse.body.data.id);

    const resourceId = createResponse.body.data.id as string;

    const listResponse = await agent
      .get("/resources?status=1&name=Test")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    assert.equal(listResponse.body.data.items.length, 1);
    assert.equal(listResponse.body.data.total, 1);

    const detailResponse = await agent
      .get(`/resources/${resourceId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    assert.equal(detailResponse.body.data.id, resourceId);

    const updateResponse = await agent
      .put(`/resources/${resourceId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        description: "Updated description",
        status: 0
      })
      .expect(200);

    assert.equal(updateResponse.body.data.description, "Updated description");
    assert.equal(updateResponse.body.data.status, 0);

    await agent
      .delete(`/resources/${resourceId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(204);

    await agent
      .get(`/resources/${resourceId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
});

test("swagger documentation is publicly accessible", async () => {
  const app = createApp();
  const agent = request(app);

  const docsResponse = await agent.get("/api-docs/").expect(200);
  assert.match(docsResponse.text, /swagger-ui/i);

  const specResponse = await agent.get("/openapi.json").expect(200);
  assert.equal(specResponse.body.openapi, "3.0.3");
  assert.ok(specResponse.body.paths["/resources"]);
});
