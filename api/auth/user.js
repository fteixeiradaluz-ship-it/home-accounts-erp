import { secret } from '../_db.js';
import { jwtVerify } from 'jose';

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(token, secret);
    return res.status(200).json({
      user: {
        id: payload.userId,
        email: payload.email
      }
    });
  } catch (err) {
    console.error('User validation error:', err);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
