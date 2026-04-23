import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.PORT = "3001";
process.env.APP_ENV = "test";
const testDbFile = path.resolve(process.cwd(), "challengeDbTest.sqlite");

// Remove test database files if they exist
for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(`${testDbFile}${suffix}`, { force: true });
}

const { app } = await import("../../src/app.js");
const { closeDatabase, dataSource, initializeDatabase } =
    await import("../../src/db/dbConfig.js");

async function resetDatabase(): Promise<void> {
    await dataSource.query("DELETE FROM resources");
    await dataSource.query("DELETE FROM sqlite_sequence WHERE name = ?", [
        "resources",
    ]);
}

before(async () => {
    await initializeDatabase();
    await resetDatabase();
});

after(async () => {
    await resetDatabase();
    await closeDatabase();

    for (const suffix of ["", "-shm", "-wal"]) {
        fs.rmSync(`${testDbFile}${suffix}`, { force: true });
    }
});

describe("Resource API", () => {
    it("creates, reads, updates, lists and deletes a resource", async () => {
        const createResponse = await request(app).post("/resources").send({
            name: "Prepare report",
            description: "Summarize Q2 metrics",
            isFinish: false,
        });

        assert.equal(createResponse.status, 201);
        assert.equal(createResponse.body.data.id, 1);
        assert.equal(createResponse.body.data.name, "Prepare report");
        assert.equal(createResponse.body.data.isFinish, false);

        const detailResponse = await request(app).get("/resources/1");
        assert.equal(detailResponse.status, 200);
        assert.equal(
            detailResponse.body.data.description,
            "Summarize Q2 metrics",
        );

        const updateResponse = await request(app).put("/resources/1").send({
            isFinish: true,
            description: "Summarize Q2 metrics and close tasks",
        });

        assert.equal(updateResponse.status, 200);
        assert.equal(updateResponse.body.data.isFinish, true);
        assert.equal(
            updateResponse.body.data.description,
            "Summarize Q2 metrics and close tasks",
        );

        const listResponse = await request(app)
            .get("/resources")
            .query({ isFinish: "true", search: "close" });

        assert.equal(listResponse.status, 200);
        assert.equal(listResponse.body.data.length, 1);
        assert.equal(listResponse.body.data[0].id, 1);

        const deleteResponse = await request(app).delete("/resources/1");
        assert.equal(deleteResponse.status, 204);

        const missingResponse = await request(app).get("/resources/1");
        assert.equal(missingResponse.status, 404);
    });

    it("rejects invalid input", async () => {
        const response = await request(app).post("/resources").send({
            name: "",
            description: "",
        });

        assert.equal(response.status, 400);
        assert.match(response.body.error, /name must not be empty/);
    });
});
