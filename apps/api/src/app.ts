import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { authRouter } from './modules/auth/index.js';
import { ordersRouter } from './modules/orders/index.js';
import { productsRouter } from './modules/products/index.js';
import { syncRouter } from './modules/sync/index.js';
import { errorMiddleware } from './middleware/index.js';

const app: Application = express();

// Security & logging
app.use(helmet());
app.use(
  cors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check — no auth required
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/sync', syncRouter);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — must be last
app.use(errorMiddleware);

export { app };
