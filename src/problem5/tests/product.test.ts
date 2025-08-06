import request from "supertest";
import app from "../src/index";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Reset DB
  await prisma.product.deleteMany();
  // Seed a product
  await prisma.product.create({
    data: {
      name: "Test Product",
      price: 100,
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /products", () => {
  it("should return all products", async () => {
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).toHaveProperty("price");
  });
});

describe("GET /products/:id", () => {
  const scenarios = [
    {
      name: "existing product",
      id: 1,
      expectedStatus: 200,
      expectedBody: { name: "Test Product", price: 100 },
    },
    {
      name: "non-existing product",
      id: 999,
      expectedStatus: 404,
      expectedBody: { message: "Not found" },
    },
    {
      name: "invalid id (non-numeric)",
      id: "abc",
      expectedStatus: 400, // Optional: if you handle bad id input
      expectedBody: { message: "Invalid ID" }, // Optional: depends on your error handler
    },
  ];

  scenarios.forEach(({ name, id, expectedStatus, expectedBody }) => {
    it(`should handle ${name}`, async () => {
      const res = await request(app).get(`/products/${id}`);
      expect(res.statusCode).toBe(expectedStatus);
      if (expectedStatus === 200) {
        expect(res.body).toMatchObject(expectedBody);
      } else {
        expect(res.body).toMatchObject(expectedBody);
      }
    });
  });
});
