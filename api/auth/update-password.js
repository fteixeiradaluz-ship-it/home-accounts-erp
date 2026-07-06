import { prisma, authenticate } from '../_db.js';
import bcrypt from 'bcryptjs';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const userId = await authenticate(req, res);
  if (!userId) return;

  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.homeUser.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (err) {
    console.error('Password update error:', err);
    return res.status(500).json({ error: 'Erro interno ao atualizar a senha.' });
  }
};
