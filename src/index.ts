import express from 'express';
import { config } from './config/index.js';
import router from './routes/index.js';
import { startWorker } from './workers/VideoWorker.js';

const app = express();
app.use(express.json());
app.use('/api', router);

const worker = startWorker();

app.listen(config.port, () => {
  console.log(`🚀 Backend rodando na porta ${config.port}`);
});