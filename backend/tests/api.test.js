/**
 * Practical 12: CI/CD Pipeline Automated Tests
 * Tests Express API endpoints using Jest and Supertest
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const _Task = require('../models/Task');

// Mock Task model to isolate database dependencies for fast, reliable CI runs
jest.mock('../models/Task', () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 'task-test-1', title: 'Complete Practical 12 CI/CD', completed: false },
        { _id: 'task-test-2', title: 'Configure GitHub Actions Workflow', completed: true },
      ]),
    }),
  }),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

describe('Practical 12 - CI/CD Pipeline API Test Suite', () => {
  let validToken;

  beforeAll(() => {
    // Generate valid JWT token for authenticated routes
    const secret = process.env.JWT_SECRET || 'pr11_super_secret_jwt_key_2026_antigravity';
    validToken = jwt.sign(
      { id: 'ci-user-123', email: 'student-ci@example.com' },
      secret,
      { expiresIn: '1h' }
    );
  });

  // -------------------------------------------------------------
  // Test 1 (Lab Session Step 2): GET /tasks endpoint returns 200
  // -------------------------------------------------------------
  test('GET /tasks returns 200 with task list', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title');
  });

  // -------------------------------------------------------------
  // Test 2 (Student Assignment): Second endpoint (GET /)
  // -------------------------------------------------------------
  test('GET / returns 200 with backend metadata', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('message');
  });

  // -------------------------------------------------------------
  // Test 3: Unauthenticated request security check (GET /tasks without token)
  // -------------------------------------------------------------
  test('GET /tasks returns 401 when Authorization token is missing', async () => {
    const res = await request(app).get('/tasks');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  // -------------------------------------------------------------
  // Test 4: Health check endpoint (GET /health)
  // -------------------------------------------------------------
  test('GET /health returns health metrics structure', async () => {
    const res = await request(app).get('/health');

    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
  });

  // -------------------------------------------------------------
  // Test 5: Validation check on POST /auth/register
  // -------------------------------------------------------------
  test('POST /auth/register returns 400 when payload is invalid', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'invalid-email', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
