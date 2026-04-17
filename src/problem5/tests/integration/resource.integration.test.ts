import test, { after, afterEach, before } from "node:test";
import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { Server } from "node:http";
import { DataSource } from "typeorm";
import { createApp } from "../../src/app";
import { env } from "../../src/config/env";
import { createAppDataSource } from "../../src/db/data-source";
import { ResourceEntity } from "../../src/entities/resource.entity";

let dataSource: DataSource;
let server: Server;
let baseUrl: string;

before(async () => {
  dataSource = createAppDataSource(env.testDatabaseUrl);
  await dataSource.initialize();

  const app = createApp(dataSource);
  server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });

  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await dataSource.query("TRUNCATE TABLE resources RESTART IDENTITY CASCADE");
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await dataSource.destroy();
});

test("creates and retrieves a resource", { concurrency: false }, async () => {
  const createResponse = await fetch(`${baseUrl}/resources`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "sku-001",
      name: "Warehouse item",
      description: "Created from integration test",
      quantity: 10
    })
  });

  assert.equal(createResponse.status, 201);
  const createdResource = (await createResponse.json()) as ResourceEntity;
  assert.equal(createdResource.code, "SKU-001");
  assert.equal(createdResource.name, "Warehouse item");
  assert.equal(createdResource.quantity, 10);

  const getResponse = await fetch(`${baseUrl}/resources/${createdResource.id}`);
  assert.equal(getResponse.status, 200);

  const fetchedResource = (await getResponse.json()) as ResourceEntity;
  assert.equal(fetchedResource.id, createdResource.id);
  assert.equal(fetchedResource.code, "SKU-001");
  assert.equal(fetchedResource.description, "Created from integration test");
});

test("rejects duplicate resource code on create", { concurrency: false }, async () => {
  const firstCreateResponse = await fetch(`${baseUrl}/resources`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "SKU-001",
      name: "First item",
      quantity: 10
    })
  });

  assert.equal(firstCreateResponse.status, 201);

  const duplicateCreateResponse = await fetch(`${baseUrl}/resources`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "sku-001",
      name: "Duplicate item",
      quantity: 5
    })
  });

  assert.equal(duplicateCreateResponse.status, 409);
  const payload = (await duplicateCreateResponse.json()) as { error: string };
  assert.equal(payload.error, "Resource code already exists");
});

test("rejects duplicate resource code on update", { concurrency: false }, async () => {
  const firstCreateResponse = await fetch(`${baseUrl}/resources`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "SKU-001",
      name: "First item",
      quantity: 10
    })
  });
  assert.equal(firstCreateResponse.status, 201);
  const firstResource = (await firstCreateResponse.json()) as ResourceEntity;

  const secondCreateResponse = await fetch(`${baseUrl}/resources`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "SKU-002",
      name: "Second item",
      quantity: 4
    })
  });
  assert.equal(secondCreateResponse.status, 201);
  const secondResource = (await secondCreateResponse.json()) as ResourceEntity;

  const updateResponse = await fetch(`${baseUrl}/resources/${secondResource.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "sku-001"
    })
  });

  assert.equal(updateResponse.status, 409);
  const payload = (await updateResponse.json()) as { error: string };
  assert.equal(payload.error, "Resource code already exists");

  const repository = dataSource.getRepository(ResourceEntity);
  const reloadedFirst = await repository.findOneByOrFail({ id: firstResource.id });
  const reloadedSecond = await repository.findOneByOrFail({ id: secondResource.id });
  assert.equal(reloadedFirst.code, "SKU-001");
  assert.equal(reloadedSecond.code, "SKU-002");
});

test("prevents lost updates under parallel increment requests using a pessimistic row lock", { concurrency: false }, async () => {
  const repository = dataSource.getRepository(ResourceEntity);
  const resource = await repository.save(
    repository.create({
      code: "SKU-LOCK-001",
      name: "Concurrent counter",
      description: "Used to verify SELECT ... FOR UPDATE behavior",
      quantity: 0
    })
  );

  const requestCount = 20;
  const incrementAmount = 5;

  const responses = await Promise.all(
    Array.from({ length: requestCount }, async () =>
      fetch(`${baseUrl}/resources/${resource.id}/increment`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: incrementAmount,
          simulateDelayMs: 50
        })
      })
    )
  );

  for (const response of responses) {
    assert.equal(response.status, 200);
  }

  const reloaded = await repository.findOneByOrFail({ id: resource.id });
  assert.equal(reloaded.quantity, requestCount * incrementAmount);
});
