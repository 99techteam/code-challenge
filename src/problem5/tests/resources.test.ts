import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

let app!: typeof import('../src/app.js')['app'];
let database!: typeof import('../src/database.js')['database'];
let initializeDatabase!: typeof import('../src/database.js')['initializeDatabase'];
let server: Server;
let baseUrl: string;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.PGLITE_DATA_DIR = 'memory://';
  ({ app } = await import('../src/app.js'));
  ({ database, initializeDatabase } = await import('../src/database.js'));
  await initializeDatabase();
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await database.close();
});

test('resource CRUD endpoints support creation, filtering, retrieval, update, and deletion', async () => {
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });

  const createdResponse = await fetch(`${baseUrl}/api/resources`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '  Notebook  ', description: 'Meeting notes', category: 'office' }),
  });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json() as { id: number; name: string; category: string };
  assert.equal(created.name, 'Notebook');
  assert.equal(created.category, 'office');
  assert.ok(created.id > 0);

  const listResponse = await fetch(`${baseUrl}/api/resources?name=note&category=office&limit=10`);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json() as { data: Array<{ id: number }> };
  assert.equal(list.data.length, 1);
  assert.equal(list.data[0].id, created.id);

  const detailResponse = await fetch(`${baseUrl}/api/resources/${created.id}`);
  assert.equal(detailResponse.status, 200);
  assert.equal((await detailResponse.json() as { description: string }).description, 'Meeting notes');

  const updateResponse = await fetch(`${baseUrl}/api/resources/${created.id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ description: 'Project notes', category: 'projects' }),
  });
  assert.equal(updateResponse.status, 200);
  const updated = await updateResponse.json() as { description: string; category: string };
  assert.equal(updated.description, 'Project notes');
  assert.equal(updated.category, 'projects');

  const deleteResponse = await fetch(`${baseUrl}/api/resources/${created.id}`, { method: 'DELETE' });
  assert.equal(deleteResponse.status, 204);
  const missingResponse = await fetch(`${baseUrl}/api/resources/${created.id}`);
  assert.equal(missingResponse.status, 404);
});

test('resource endpoints return validation and not-found errors', async () => {
  const invalidCreate = await fetch(`${baseUrl}/api/resources`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '  ' }),
  });
  assert.equal(invalidCreate.status, 400);

  const invalidId = await fetch(`${baseUrl}/api/resources/not-a-number`);
  assert.equal(invalidId.status, 400);

  const missingDelete = await fetch(`${baseUrl}/api/resources/999999`, { method: 'DELETE' });
  assert.equal(missingDelete.status, 404);
});
