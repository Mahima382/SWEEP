/**
 * SWEEP backend entry point. Loads environment variables, then starts
 * the HTTP server. Keep listen() here so app.js stays testable.
 */

require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
