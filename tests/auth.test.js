const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

// Connect to a test database before running tests
beforeAll(async () => {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Clear database between tests
beforeEach(async () => {
  await User.deleteMany();
});

// Close database connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    // First register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    // Then try to login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should get user profile with valid token', async () => {
    // First register a user
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    // Then get profile using the token
    const res = await request(app)
      .get('/api/auth/me')
      .set('x-auth-token', register.body.token);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });
});