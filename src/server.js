import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { setupDependencies } from './config/dependencies.js';
import cepRoutes from './routes/cepRoutes.js';

dotenv.config();
setupDependencies();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cep-crawler-api' });
});

app.use('/', cepRoutes);

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

async function startServer() {
  await connectDatabase();
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer().catch(console.error);

process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  await mongoose.disconnect();
  process.exit(0);
});