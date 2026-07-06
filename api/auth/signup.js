import { prisma } from '../_db.js';
import bcrypt from 'bcryptjs';

export default async (req, res) => {
  return res.status(403).json({ error: 'O cadastro de novos usuários foi desativado pelo administrador.' });
};
