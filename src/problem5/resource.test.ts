import request from "supertest"
import express from "express"
import resourceController from "./resource/controller"
import { db } from "./database"

const app = express()
app.use(express.json())
app.use("/resource", resourceController)

describe("Resource API", () => {
  beforeAll(() => {
    // Reset the database before all tests
    db.exec("DELETE FROM resources")
  })

  afterEach(() => {
    // Clean up the database after each test
    db.exec("DELETE FROM resources")
  })

  it("should create a new resource", async () => {
    const response = await request(app)
      .post("/resource")
      .send({ name: "Test Resource", description: "A resource for testing" })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.name).toBe("Test Resource")
  })

  it("should list all resources", async () => {
    // Create a resource first
    await request(app)
      .post("/resource")
      .send({ name: "Test Resource 1", description: "A resource for testing" })

    const response = await request(app).get("/resource")

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].name).toBe("Test Resource 1")
  })

  it("should get a resource by ID", async () => {
    const createResponse = await request(app)
      .post("/resource")
      .send({ name: "Another Test Resource", description: "Details matter" })

    const resourceId = createResponse.body.id
    const response = await request(app).get(`/resource/${resourceId}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(resourceId)
  })

  it("should update a resource", async () => {
    const createResponse = await request(app)
      .post("/resource")
      .send({ name: "Old Name", description: "Original description" })

    const resourceId = createResponse.body.id
    const response = await request(app).put(`/resource/${resourceId}`).send({ name: "New Name" })

    expect(response.status).toBe(200)
    expect(response.body.name).toBe("New Name")
  })

  it("should delete a resource", async () => {
    const createResponse = await request(app)
      .post("/resource")
      .send({ name: "To Be Deleted", description: "Delete me" })

    const resourceId = createResponse.body.id
    const deleteResponse = await request(app).delete(`/resource/${resourceId}`)

    expect(deleteResponse.status).toBe(204)

    const getResponse = await request(app).get(`/resource/${resourceId}`)
    expect(getResponse.status).toBe(404)
  })

  it("should filter resources by name and date", async () => {
    await request(app).post("/resource").send({ name: "Filter Test 1" })
    await request(app).post("/resource").send({ name: "Another Filter" })
    const year = new Date().getFullYear()
    const response = await request(app).get(`/resource?name=Test&from=${year}-01-01&to=${year}-12-31`)
  
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].name).toBe("Filter Test 1")
  })
})
