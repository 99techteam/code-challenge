import assert from 'assert';
import request from 'supertest';
import { AppDataSource } from '../data-source';
import app from '../app';

async function run() {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(true);

  const createResponse = await request(app)
    .post('/resources')
    .send({ name: 'Test Resource', description: 'A sample resource' })
    .expect(201);

  assert.strictEqual(createResponse.body.name, 'Test Resource');
  assert.strictEqual(createResponse.body.description, 'A sample resource');
  assert.ok(createResponse.body.id);

  const listResponse = await request(app).get('/resources').expect(200);
  assert(Array.isArray(listResponse.body));
  assert(listResponse.body.length >= 1);

  const id = createResponse.body.id;

  const getResponse = await request(app).get(`/resources/${id}`).expect(200);
  assert.strictEqual(getResponse.body.id, id);
  assert.strictEqual(getResponse.body.name, 'Test Resource');

  const updateResponse = await request(app)
    .put(`/resources/${id}`)
    .send({ name: 'Updated Resource' })
    .expect(200);
  assert.strictEqual(updateResponse.body.name, 'Updated Resource');

  await request(app).delete(`/resources/${id}`).expect(204);

  await request(app).get(`/resources/${id}`).expect(404);

  await AppDataSource.destroy();
  console.log('Resource controller tests passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
