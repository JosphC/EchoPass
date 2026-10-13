const express = require('express');
const { healthRouter } = require('./health');
const { apiRouter } = require('./routes');
const { registerWalletRoutes } = require('./wallet');

const app = express();
app.use(express.json());
app.use('/health', healthRouter);
app.use('/', apiRouter);
registerWalletRoutes(apiRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, '0.0.0.0', () => {
  console.log(`EchoPass mock-api listening on ${port}`);
});
