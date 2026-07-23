import express from 'express';
import { config } from './config/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/api/stats', (req, res) => {
  res.json({
    pendentes: 5,
    processando: 2,
    concluidos: 12,
    erros: 1
  });
});

app.post('/api/roteiros', (req, res) => {
  console.log('Novo roteiro recebido:', req.body);
  res.json({ success: true, id: 'abc123' });
});

app.listen(config.port, () => {
  console.log(`🚀 Backend rodando na porta ${config.port}`);
});