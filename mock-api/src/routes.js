const express = require('express');
const seed = require('../data/seed.json');

const apiRouter = express.Router();

apiRouter.get('/wallet', (req, res) => {
  res.json({ pass: seed.pass, paymentMethod: seed.paymentMethod, dailyCap: seed.dailyCap, charges: seed.charges });
});
apiRouter.get('/buses', (req, res) => res.json({ buses: seed.buses, positions: seed.positions }));
apiRouter.get('/reports', (req, res) => res.json({ reports: seed.reports }));
apiRouter.get('/trips', (req, res) => res.json({ savedRoutes: seed.savedRoutes, recentTrips: seed.recentTrips }));
apiRouter.get('/notifications', (req, res) => res.json({ notifications: seed.notifications }));

module.exports = { apiRouter };
