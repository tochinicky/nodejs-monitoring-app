const request = require('supertest');
const app = require('../app');

describe('DORA Metrics Monitoring App', () => {
  test('GET / should return 200 and HTML content', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Test App for DORA Metrics');
  });

  test('GET /metrics should return 200 and Prometheus metrics', async () => {
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.text).toContain('dora_deployments_total');
  });

  test('GET /deploy should return 200 and deployment info', async () => {
    const response = await request(app).get('/deploy');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Deployment Simulated');
  });

  test('GET /recover should return 200 and recovery info', async () => {
    const response = await request(app).get('/recover');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Recovery Simulated');
  });
});
