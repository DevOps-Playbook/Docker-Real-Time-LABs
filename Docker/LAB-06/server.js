const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const API_HOST = 'localhost'; // BUG: each container has its own network namespace
const API_PORT = 4000;

app.get('/', (req, res) => {
  http.get(`http://${API_HOST}:${API_PORT}/api/posts`, (apiRes) => {
    let body = '';
    apiRes.on('data', (chunk) => (body += chunk));
    apiRes.on('end', () => res.send(`Got from API: ${body}`));
  }).on('error', (err) => {
    res.status(502).send(`Failed to reach API service: ${err.message}`);
  });
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(PORT, () => console.log(`web listening on ${PORT}, calling API at ${API_HOST}:${API_PORT}`));
