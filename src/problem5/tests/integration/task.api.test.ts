import request from "supertest";
import app from "../../src/index";

describe("Task API Integration Tests", () => {
  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const newTask = {
        title: "Integration Test Task",
        description: "This is a test task",
        status: "TODO",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe(newTask.title);
      expect(response.body.data.description).toBe(newTask.description);
      expect(response.body.data.status).toBe(newTask.status);
    });

    it("should return 400 for invalid task data", async () => {
      const invalidTask = {
        // Missing required title field
        description: "Invalid task",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toHaveProperty("title");
    });

    it("should return 400 for invalid status", async () => {
      const invalidTask = {
        title: "Task with invalid status",
        status: "INVALID_STATUS",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toHaveProperty("status");
    });
  });

  describe("GET /api/tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty("count");
    });

    it("should filter tasks by status", async () => {
      const todoTask = await request(app)
        .post("/api/tasks")
        .send({ title: "Filter Status TODO", status: "TODO" });
      const doneTask = await request(app)
        .post("/api/tasks")
        .send({ title: "Filter Status DONE", status: "DONE" });

      const response = await request(app)
        .get("/api/tasks?status=TODO")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.find((t: any) => t.id === todoTask.body.data.id)
      ).toBeTruthy();
      expect(
        response.body.data.find((t: any) => t.id === doneTask.body.data.id)
      ).toBeFalsy();
    });

    it("should filter tasks by keyword in title or description", async () => {
      const keywordTask = await request(app)
        .post("/api/tasks")
        .send({ title: "UniqueKeywordTitle", description: "desc" });
      await request(app)
        .post("/api/tasks")
        .send({ title: "Other Task", description: "No match here" });

      const response = await request(app)
        .get("/api/tasks?keyword=UniqueKeywordTitle")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain(
        keywordTask.body.data.title
      );
      expect(response.body.data[0].description).toContain(
        keywordTask.body.data.description
      );
    });

    it("should return 400 for invalid status filter", async () => {
      const response = await request(app)
        .get("/api/tasks?status=INVALID")
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body.message).toMatch(/Invalid status/);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a specific task", async () => {
      // First create a task
      const newTask = {
        title: "Specific Task Test",
        description: "Test description",
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(newTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
      expect(response.body.data.title).toBe(newTask.title);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body.message).toBe("Task not found");
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    it("should update a task", async () => {
      // First create a task
      const newTask = {
        title: "Task to Update",
        status: "TODO",
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(newTask);

      const taskId = createResponse.body.data.id;

      const updateData = {
        title: "Updated Task Title",
        status: "IN_PROGRESS",
      };

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it("should return 400 for invalid update data", async () => {
      const updateData = {
        status: "INVALID_STATUS",
      };

      const response = await request(app)
        .patch("/api/tasks/some-id")
        .send(updateData)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.message).toBe("Validation failed");
    });

    it("should return 404 when updating non-existent task", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const updateData = {
        title: "Updated Title",
      };

      const response = await request(app)
        .patch(`/api/tasks/${fakeId}`)
        .send(updateData)
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body.message).toBe("Task not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should soft delete a task", async () => {
      // First create a task
      const newTask = {
        title: "Task to Delete",
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(newTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("soft deleted");

      // Verify task is not returned in normal GET
      await request(app).get(`/api/tasks/${taskId}`).expect(404);
    });

    it("should hard delete a task when specified", async () => {
      // First create a task
      const newTask = {
        title: "Task to Hard Delete",
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(newTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}?hard=true`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("permanently deleted");
    });

    it("should return 404 when deleting non-existent task", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body.message).toBe("Task not found");
    });
  });

  describe("POST /api/tasks/:id/restore", () => {
    it("should restore a soft deleted task", async () => {
      // First create and delete a task
      const newTask = {
        title: "Task to Restore",
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(newTask);

      const taskId = createResponse.body.data.id;

      // Soft delete the task
      await request(app).delete(`/api/tasks/${taskId}`);

      // Restore the task
      const response = await request(app)
        .post(`/api/tasks/${taskId}/restore`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("restored");

      // Verify task is accessible again
      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(getResponse.body.data.id).toBe(taskId);
    });

    it("should return 400 when restoring non-deleted task", async () => {
      // Create a task without deleting it
      const newTask = {
        title: "Active Task",
      };

      const createResponse = await request(app)
        .post("/api/tasks")
        .send(newTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/tasks/${taskId}/restore`)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.message).toBe("Task is not deleted");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app)
        .get("/health")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.status).toBe("OK");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app)
        .get("/api/nonexistent")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body.message).toContain("not found");
    });
  });
});
