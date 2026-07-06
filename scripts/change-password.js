import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    }
  } catch (err) {
    console.warn('Aviso ao carregar .env:', err.message);
  }
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.argv[2];
  const emailTarget = process.argv[3] || 'fteixeiradaluz@gmail.com';

  if (!newPassword || newPassword.length < 6) {
    console.log('\n❌ Por favor, forneça uma senha com no mínimo 6 caracteres.');
    console.log('Exemplo de uso: npm run set-password -- "SuaNovaSenhaSegura123"\n');
    process.exit(1);
  }

  console.log(`🔐 Atualizando senha no Neon Postgres para os usuários...`);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Atualizar para o usuário principal
  const user1 = await prisma.homeUser.updateMany({
    where: { email: 'fteixeiradaluz@gmail.com' },
    data: { password: hashedPassword }
  });

  // Atualizar para o usuário secundário
  const user2 = await prisma.homeUser.updateMany({
    where: { email: 'pat.vortmann@gmail.com' },
    data: { password: hashedPassword }
  });

  console.log(`✅ Senha atualizada com sucesso para ${user1.count + user2.count} usuário(s)!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao atualizar senha:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
