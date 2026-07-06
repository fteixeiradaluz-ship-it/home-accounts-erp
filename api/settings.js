import { prisma, authenticate } from './_db.js';

export default async (req, res) => {
  const userId = await authenticate(req, res);
  if (!userId) return;

  if (req.method === 'GET') {
    try {
      let settings = await prisma.userSettings.findUnique({
        where: { userId }
      });

      if (!settings) {
        // Create default settings on first load if missing
        settings = await prisma.userSettings.create({
          data: {
            userId,
            salaryFabricio: 4000.00,
            salaryPatricia: 2500.00,
            extraIncome: 0.00,
            cards: ['Cartão Principal', 'Cartão Adicional', 'Pix / Débito', 'Dinheiro'],
            savingsGoalType: 'percentage',
            savingsGoalValue: 15.00,
            budgetLimits: {
              'Moradia': 2000,
              'Transporte': 1000,
              'Saúde': 500,
              'Alimentação': 1500,
              'Lanches': 200,
              'Alimentação Trabalho': 400,
              'Lazer & Assinaturas': 500,
              'Seguros & Proteção': 300,
              'Outros': 500
            }
          }
        });
      }

      return res.status(200).json({ settings });
    } catch (err) {
      console.error('Get settings error:', err);
      return res.status(500).json({ error: 'Erro ao obter configurações.' });
    }
  } else if (req.method === 'POST') {
    const { salaryFabricio, salaryPatricia, extraIncome, cards, savingsGoalType, savingsGoalValue, budgetLimits } = req.body;
    try {
      const settings = await prisma.userSettings.upsert({
        where: { userId },
        update: {
          salaryFabricio: salaryFabricio !== undefined ? parseFloat(salaryFabricio) : undefined,
          salaryPatricia: salaryPatricia !== undefined ? parseFloat(salaryPatricia) : undefined,
          extraIncome: extraIncome !== undefined ? parseFloat(extraIncome) : undefined,
          cards,
          savingsGoalType,
          savingsGoalValue: savingsGoalValue !== undefined ? parseFloat(savingsGoalValue) : undefined,
          budgetLimits
        },
        create: {
          userId,
          salaryFabricio: salaryFabricio !== undefined ? parseFloat(salaryFabricio) : 4000.00,
          salaryPatricia: salaryPatricia !== undefined ? parseFloat(salaryPatricia) : 2500.00,
          extraIncome: extraIncome !== undefined ? parseFloat(extraIncome) : 0.00,
          cards: cards || ['Cartão Principal', 'Cartão Adicional', 'Pix / Débito', 'Dinheiro'],
          savingsGoalType: savingsGoalType || 'percentage',
          savingsGoalValue: savingsGoalValue !== undefined ? parseFloat(savingsGoalValue) : 15.00,
          budgetLimits: budgetLimits || {}
        }
      });

      return res.status(200).json({ settings });
    } catch (err) {
      console.error('Save settings error:', err);
      return res.status(500).json({ error: 'Erro ao salvar configurações.' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
};
