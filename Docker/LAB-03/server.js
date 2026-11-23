const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error('FATAL: MONGO_URL environment variable is not set. Cannot start without a database connection string.');
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send(`OK - connected using ${mongoUrl}`);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', mongoUrl });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}, using Mongo at ${mongoUrl}`);
});
