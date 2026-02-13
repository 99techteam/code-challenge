import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../Index'; // adjust path if needed

describe('Problem 5 - CRUD Users (integration)', () => {
  let userId;

  it('creates a user', async () => {
    const res = await request(app)
      .post('/problem5/users')
      .send({
        name: 'Simple User',
        email: 'simple@example.com',
        age: 20,
        phone: '123456'
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    userId = res.body.id;
  });

  it('updates a user', async () => {
    const res = await request(app)
      .put(`/problem5/users/${userId}`)
      .send({
        name: 'Updated User',
        email: 'updated@example.com',
        age: 21,
        phone: '987654'
      });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated User');
  });

  it('deletes a user', async () => {
    const res = await request(app).delete(`/problem5/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
  });
});