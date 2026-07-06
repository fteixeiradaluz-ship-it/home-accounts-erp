import { prisma } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const startTime = Date.now();
  try {
    // Executa uma query simples de verificação de conexão com o banco Neon Postgres
    const userCount = await prisma.homeUser.count();
    const durationMs = Date.now() - startTime;

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      provider: 'Neon Postgres',
      registeredUsers: userCount,
      latencyMs: durationMs,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health check database error:', err);
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
