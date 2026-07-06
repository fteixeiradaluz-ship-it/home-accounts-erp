import { prisma, secret } from '../_db.js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Find user
    const user = await prisma.homeUser.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Generate JWT
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erro interno ao efetuar login.' });
  }
};
