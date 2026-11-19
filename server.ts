import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { initDatabase, getPool } from './server/db.ts';
import { apiRouter } from './server/routes/apiRoutes.ts';
import { aiRouter } from './server/routes/aiRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Initialize PostgreSQL schema & initial seed if empty
  await initDatabase();
  console.log('Connected to PostgreSQL database and verified schema.');

  app.get('/api/health', async (_req, res) => {
    try {
      await getPool().query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
      console.error('Database healthcheck failed:', err);
      res.status(500).json({ status: 'error', database: 'disconnected' });
    }
  });

  const isSourceModule = (p: string) => /\.(ts|tsx|js|jsx|mjs|map)$/.test(p);

  app.use('/api/ai', (req, res, next) => {
    if (isSourceModule(req.path)) return next();
    return aiRouter(req, res, next);
  });
  app.use('/api', (req, res, next) => {
    if (isSourceModule(req.path)) return next();
    return apiRouter(req, res, (err?: any) => {
      if (err) return next(err);
      res.status(404).json({ message: 'API endpoint not found.' });
    });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
