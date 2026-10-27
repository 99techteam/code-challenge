import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { createApp } from './app.js';
import { TaskStore } from './db.js';

const directory = mkdtempSync(join(tmpdir(), 'tasks-api-'));
const dbPath = join(directory, 'tasks.sqlite');
let store = new TaskStore(dbPath);
const server = createApp(store).listen(0);
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
const base = `http://localhost:${address.port}`;
after(() => new Promise<void>(resolve => server.close(() => {
  store.close();
  rmSync(directory, { recursive: true, force: true });
  resolve();
})));

async function request(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(base + path, { method, headers: body === undefined ? {} : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}

test('create, persist, filter, update and delete a task', async () => {
  const created = await request('/api/tasks', 'POST', { title: '  Write docs  ', status: 'todo' });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.title, 'Write docs');
  const id = created.body.data.id;

  // Reopening the SQLite file proves that data is not held only in process memory.
  const secondConnection = new TaskStore(dbPath);
  assert.equal(secondConnection.get(id)?.title, 'Write docs');
  secondConnection.close();

  assert.equal((await request(`/api/tasks/${id}`)).body.data.id, id);
  const listing = await request('/api/tasks?status=todo&q=write&page=1&limit=5');
  assert.equal(listing.body.pagination.total, 1);
  assert.equal(listing.body.data[0].id, id);
  assert.equal((await request('/api/tasks?status=done')).body.pagination.total, 0);

  const updated = await request(`/api/tasks/${id}`, 'PATCH', { status: 'done' });
  assert.equal(updated.body.data.status, 'done');
  assert.equal((await request(`/api/tasks/${id}`, 'DELETE')).status, 204);
  assert.equal((await request(`/api/tasks/${id}`)).status, 404);
});

test('returns useful errors for invalid input and unknown resources', async () => {
  assert.equal((await request('/api/tasks', 'POST', { title: ' ' })).status, 400);
  assert.equal((await request('/api/tasks', 'POST', { title: 'X', unexpected: 1 })).status, 400);
  assert.equal((await request('/api/tasks/abc')).status, 400);
  assert.equal((await request('/api/tasks/999999', 'PATCH', { title: 'X' })).status, 404);
  assert.equal((await request('/api/tasks/999999', 'DELETE')).status, 404);
  assert.equal((await request('/api/tasks?limit=101')).status, 400);
  const malformed = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, 'INVALID_JSON');
});
