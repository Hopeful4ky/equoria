import request from 'supertest';
import app from '../../backend/app.js'; // Adjusted path to backend/app.js and .js extension

describe('GET /ping', () => {
  it('should return { message: "pong" }', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'pong' });
  });
});