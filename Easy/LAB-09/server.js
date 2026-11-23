const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_DIR = '/app/logs';
const LOG_FILE = path.join(LOG_DIR, 'access.log');

app.use((req, res, next) => {
  const line = `${new Date().toISOString()} ${req.method} ${req.path}\n`;
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (err) {
    console.error('Failed to write access log:', err.message);
    return res.status(500).send(`Logging failed: ${err.message}`);
  }
  next();
});

app.get('/', (req, res) => res.send('OK - WanderOps Incident App is healthy'));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}, logging to ${LOG_FILE}`));
