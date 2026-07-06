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
  console.log('🌱 Iniciando seed do banco de dados Neon Postgres...');

  const primaryEmail = 'fteixeiradaluz@gmail.com';
  const hashedPassword = await bcrypt.hash('senha142536@', 10);

  // Criar ou atualizar usuário principal
  const user = await prisma.homeUser.upsert({
    where: { email: primaryEmail },
    update: { password: hashedPassword },
    create: {
      email: primaryEmail,
      password: hashedPassword,
      settings: {
        create: {
          salaryFabricio: 4000.0,
          salaryPatricia: 2500.0,
          extraIncome: 0.0,
          cards: ['Nubank', 'Inter', 'Itaú', 'Santander', 'Bradesco', 'Dinheiro/PIX'],
          savingsGoalType: 'percentage',
          savingsGoalValue: 15.0,
          budgetLimits: {
            Alimentação: 1500,
            Moradia: 2000,
            Lazer: 600,
            Saúde: 400,
            Transporte: 500,
            Outros: 500
          }
        }
      }
    }
  });

  console.log(`✅ Usuário criado/existente: ${user.email} (ID: ${user.id})`);

  // Criar usuário secundário para login se não existir
  const secondaryEmail = 'pat.vortmann@gmail.com';
  const secondaryUser = await prisma.homeUser.upsert({
    where: { email: secondaryEmail },
    update: { password: hashedPassword },
    create: {
      email: secondaryEmail,
      password: hashedPassword
    }
  });

  console.log(`✅ Usuário secundário criado/existente: ${secondaryUser.email}`);
  console.log('🚀 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
