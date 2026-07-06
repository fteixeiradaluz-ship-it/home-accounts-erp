import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['warn', 'error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'home-accounts-secret-key-2026');

export async function authenticate(req, res) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido ou inválido' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Suporte ao usuário secundário que compartilha a mesma conta/workspace
    if (payload.email === 'pat.vortmann@gmail.com') {
      const primaryUser = await prisma.homeUser.findUnique({
        where: { email: 'fteixeiradaluz@gmail.com' }
      });
      if (primaryUser) {
        return primaryUser.id;
      }
    }
    
    return payload.userId;
  } catch (err) {
    console.error('Erro na validação do token JWT:', err.message);
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return null;
  }
}
