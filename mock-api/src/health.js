const { Router } = require('express');

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'echopass-mock-api' });
});

module.exports = { healthRouter };
