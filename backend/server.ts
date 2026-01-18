import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import usersRouter from './routes/users';
import statsRouter from './routes/stats';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API routes
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// API root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Remna Panel Telegram Bot API',
    version: '2.1.0',
    docs: 'https://github.com/marksventsitsky/RemnaPanelMiniApp'
  });
});

// Serve frontend static files (built by multi-stage Docker)
const staticPath = path.join(__dirname, '../static');
app.use(express.static(staticPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req: Request, res: Response) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/users') || req.path.startsWith('/stats')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.environment === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Remna Panel Telegram Mini App                          ║
║   TypeScript Backend + Frontend                           ║
╠═══════════════════════════════════════════════════════════╣
║   🚀 Server running on port ${PORT}                          ║
║   🌍 Environment: ${config.environment.padEnd(37)}║
║   📡 Remna Panel: ${config.remnaPanelUrl.substring(0, 32).padEnd(37)}║
║   👥 Admin IDs: ${config.adminIdsList.join(', ').substring(0, 35).padEnd(37)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('💤 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('💤 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

