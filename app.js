const express = require('express');
const prometheus = require('prom-client');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Setup Prometheus registry
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

//////////////////
// Create DORA metrics
const deploymentCounter = new prometheus.Counter({
  name: 'dora_deployments_total',
  help: 'Count of deployments',
  labelNames: ['type', 'result'],
});

const leadTimeGauge = new prometheus.Gauge({
  name: 'dora_lead_time_seconds',
  help: 'Time from commit to deployment in seconds',
  labelNames: ['deployment_id'],
});

const recoveryTimeGauge = new prometheus.Gauge({
  name: 'dora_recovery_time_seconds',
  help: 'Time to recover from a failure in seconds',
  labelNames: ['incident_id'],
});

const deploymentFrequencyGauge = new prometheus.Gauge({
  name: 'dora_deployment_frequency',
  help: 'Number of deployments per day',
});

const changeFailureRateGauge = new prometheus.Gauge({
  name: 'dora_change_failure_rate',
  help: 'Percentage of deployments that failed',
});
////////////////////////////
// CI/CD Metrics
const buildDurationGauge = new prometheus.Gauge({
  name: 'cicd_build_duration_seconds',
  help: 'Duration of CI/CD builds',
  labelNames: ['workflow', 'repository', 'branch'],
});

const buildCounter = new prometheus.Counter({
  name: 'cicd_builds_total',
  help: 'Count of CI builds',
  labelNames: ['workflow', 'repository', 'branch', 'result'],
});

register.registerMetric(deploymentCounter);
register.registerMetric(leadTimeGauge);
register.registerMetric(recoveryTimeGauge);
register.registerMetric(deploymentFrequencyGauge);
register.registerMetric(changeFailureRateGauge);
register.registerMetric(buildDurationGauge);
register.registerMetric(buildCounter);

// Deployment statistics
let deploymentStats = {
  total: 0,
  failed: 0,
  succeeded: 0,
};

// Enable JSON body parsing
app.use(bodyParser.json());

// Simulate some initial metrics here
deploymentCounter.inc({ type: 'deployment', result: 'success' });
leadTimeGauge.set({ deployment_id: 'initial' }, 3600); // 1 hour
recoveryTimeGauge.set({ incident_id: 'initial' }, 900); // 15 minutes
deploymentFrequencyGauge.set(5); // 5 per day
changeFailureRateGauge.set(10); // 10%
buildDurationGauge.set(
  { workflow: 'default', repository: 'nodejs-monitoring-app', branch: 'main' },
  120
);
buildCounter.inc({
  workflow: 'default',
  repository: 'nodejs-monitoring-app',
  branch: 'main',
  result: 'success',
});
deploymentStats.total++;
deploymentStats.succeeded++;

// Update change failure rate based on deployment stats
function updateChangeFailureRate() {
  if (deploymentStats.total > 0) {
    const failureRate = (deploymentStats.failed / deploymentStats.total) * 100;
    changeFailureRateGauge.set(failureRate);
  }
}

// Endpoints
app.get('/', (req, res) => {
  res.send(
    `<html><head><title>Test App for DORA Metrics</title></head><body><h1>Test App for DORA Metrics</h1><p>This application simulates a service that records DORA metrics for monitoring.</p><h2>Simulate Actions:</h2><ul><li><a href="/deploy?result=success">Simulate Successful Deployment</a></li><li><a href="/deploy?result=failure">Simulate Failed Deployment</a></li><li><a href="/recover">Simulate Recovery from Incident</a></li><li><a href="/metrics">View Prometheus Metrics</a></li></ul><h2>Current Stats:</h2><ul><li>Total Deployments: ${
      deploymentStats.total
    }</li><li>Failed Deployments: ${deploymentStats.failed}</li><li>Success Rate: ${
      deploymentStats.total > 0
        ? ((deploymentStats.succeeded / deploymentStats.total) * 100).toFixed(2)
        : 0
    }%</li></ul></body></html>`
  );
});

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/deploy', (req, res) => {
  const result = req.query.result || (Math.random() > 0.2 ? 'success' : 'failure');
  const deploymentId = `dep-${Date.now()}`;
  const leadTime = Math.floor(Math.random() * 86400); // Random time up to 24 hours

  deploymentCounter.inc({ type: 'deployment', result: result });
  leadTimeGauge.set({ deployment_id: deploymentId }, leadTime);

  // Update deployment stats
  deploymentStats.total++;
  if (result === 'success') {
    deploymentStats.succeeded++;
  } else {
    deploymentStats.failed++;
  }
  updateChangeFailureRate();

  // Update deployment frequency
  deploymentFrequencyGauge.set(deploymentStats.total / 30); // Assume over 30 days

  res.send(
    `<html><head><title>Deployment Simulated</title></head><body><h1>Deployment Simulated</h1><p>Result: ${result}</p><p>Deployment ID: ${deploymentId}</p><p>Lead Time: ${leadTime} seconds (${(
      leadTime / 3600
    ).toFixed(2)} hours)</p><p><a href="/">Back to Home</a></p></body></html>`
  );
});

app.get('/recover', (req, res) => {
  const incidentId = `inc-${Date.now()}`;
  const recoveryTime = Math.floor(Math.random() * 3600); // Random time up to 1 hour

  recoveryTimeGauge.set({ incident_id: incidentId }, recoveryTime);

  res.send(
    `<html><head><title>Recovery Simulated</title></head><body><h1>Recovery Simulated</h1><p>Incident ID: ${incidentId}</p><p>Recovery Time: ${recoveryTime} seconds (${(
      recoveryTime / 60
    ).toFixed(2)} minutes)</p><p><a href="/">Back to Home</a></p></body></html>`
  );
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

module.exports = app;
