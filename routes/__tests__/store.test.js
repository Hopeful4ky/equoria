process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app, server: expressServer } = require('../../index');
const pool = require('../../config/db');
const { stopHealthScheduler } = require('../../utils/healthScheduler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Store API Endpoints'), () => {
  beforeAll(async () => {});

  beforeEach(async () => {
    const client = await pool.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE TABLE users, horses, stables, breeds, conformation_ratings, gait_ratings RESTART IDENTITY CASCADE');
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during beforeEach DB cleanup in store.test.js:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  );

  afterAll(async () => {
    if (pool && typeof pool.pool.end === 'function') {
      await pool.pool.end();
      console.log('Database pool closed in store.test.js.');
    }
    stopHealthScheduler();
    if (expressServer && typeof expressServer.close === 'function') {
      await new Promise((resolve) => expressServer.close(resolve));
      console.log('Express server closed in store.test.js.');
    }
  });

  describe('POST /api/store/purchase-horse'), () => {
    let testUser;
    let testToken;
    let testBreed}
  }