import request from "supertest";
import express from "express";
import { createResource, listResources, getResource, updateResource, deleteResource } from "../controller/resource.controller";
import { AppDataSource } from "../config/data-source";

const app = express();
app.use(express.json());
app.post("/api/resources", createResource);
app.get("/api/resources", listResources);
app.get("/api/resources/:id", getResource);
app.put("/api/resources/:id", updateResource);
app.delete("/api/resources/:id", deleteResource);

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe("Resource Controller Tests", () => {
  let resourceId: string; // Changed from number to string

  // Test create resource
  it("should create a new resource", async () => {
    const response = await request(app)
      .post("/api/resources")
      .send({
        name: "Test Resource",
        description: "Test description",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("string"); // Verify it's a string (UUID)
    expect(response.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i); // UUID format
    expect(response.body.name).toBe("Test Resource");
    expect(response.body.description).toBe("Test description");

    resourceId = response.body.id;  // Save the created resource UUID
  });

  // Test invalid UUID format
  it("should return 400 for invalid UUID format", async () => {
    const response = await request(app).get("/api/resources/invalid-uuid");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid UUID format");
  });

  // Test get all resources
  it("should return a list of resources", async () => {
    const response = await request(app).get("/api/resources");
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test get a resource by ID
  it("should get resource by id", async () => {
    const response = await request(app).get(`/api/resources/${resourceId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(resourceId);
    expect(response.body.name).toBe("Test Resource");
  });

  // Test update resource
  it("should update the resource", async () => {
    const response = await request(app)
      .put(`/api/resources/${resourceId}`)
      .send({
        name: "Updated Resource",
        description: "Updated description",
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Resource");
    expect(response.body.description).toBe("Updated description");
  });

  // Test delete resource
  it("should delete the resource", async () => {
    const response = await request(app).delete(`/api/resources/${resourceId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Resource deleted successfully");
  });
});
