import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './db/index.js';

const PORT = Number(process.env['PORT'] ?? 3001);

async function main(): Promise<void> {
  // Verify DB connection before accepting traffic
  await prisma.$connect();
  console.log('Database connected');

  app.listen(PORT, () => {
    console.log(`SwiftPOS API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
