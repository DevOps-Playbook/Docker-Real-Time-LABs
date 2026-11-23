const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.get('/api/posts', (req, res) => {
  res.json([{ id: 1, title: 'Hello from the API service' }]);
});

app.listen(PORT, () => console.log(`api listening on ${PORT}`));
