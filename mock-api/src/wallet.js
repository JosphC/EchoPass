const seed = require('../data/seed.json');

let counter = 100;

function tokenFor(id) {
  return `tok_mock_${id}`;
}

function registerWalletRoutes(apiRouter) {
  const items = [...seed.items];
  const charges = [...seed.charges];

  apiRouter.get('/wallet', (req, res) => {
    res.json({ items, dailyCap: seed.dailyCap, charges });
  });
  apiRouter.get('/wallet/items', (req, res) => res.json({ items }));
  apiRouter.get('/wallet/charges', (req, res) => res.json({ charges }));

  apiRouter.post('/wallet/cards', (req, res) => {
    counter += 1;
    const id = `card-${counter}`;
    const item = { kind: 'card', id, ...req.body, token: tokenFor(id) };
    items.push(item);
    res.status(201).json(item);
  });

  apiRouter.post('/wallet/passes', (req, res) => {
    counter += 1;
    const id = `pass-${counter}`;
    const item = { kind: 'pass', id, ...req.body, validFrom: new Date().toISOString().slice(0, 10) };
    items.push(item);
    res.status(201).json(item);
  });

  apiRouter.post('/wallet/charges', (req, res) => {
    counter += 1;
    const id = `ch-${counter}`;
    const charge = { id, ...req.body, currency: 'RON', startedAt: new Date().toISOString(), qrToken: `qr_mock_${id}` };
    charges.unshift(charge);
    res.status(201).json(charge);
  });

  apiRouter.patch('/wallet/charges/:id', (req, res) => {
    const found = charges.find((c) => c.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    Object.assign(found, req.body);
    res.json(found);
  });
}

module.exports = { registerWalletRoutes };
