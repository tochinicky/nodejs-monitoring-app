module.exports = {
  apps: [
    {
      name: "monitor-app",
      script: "app.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
