const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.send("Node.js App is Running!"));

app.get("/metrics", (req, res) => {
  res.send(`# HELP request_count Number of requests
# TYPE request_count counter
request_count{method="GET", path="/metrics"} 1
`);
});

app.listen(port, () => console.log(`App listening on port ${port}`));
