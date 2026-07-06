import { prisma, authenticate } from './_db.js';

export default async (req, res) => {
  const userId = await authenticate(req, res);
  if (!userId) return;

  if (req.method === 'GET') {
    const { monthKey } = req.query;
    if (!monthKey) {
      return res.status(400).json({ error: 'Mês (monthKey) é obrigatório.' });
    }

    try {
      let bills = await prisma.fixedBill.findMany({
        where: { userId, monthKey }
      });

      if (!bills || bills.length === 0) {
        // Load templates to generate initial bills
        const templates = await prisma.fixedBillTemplate.findMany({
          where: { userId }
        });

        if (templates.length > 0) {
          await prisma.fixedBill.createMany({
            data: templates.map(t => ({
              userId,
              monthKey,
              name: t.name,
              value: t.value,
              dueDate: t.dueDate,
              card: t.card,
              paid: false
            }))
          });

          // Fetch again
          bills = await prisma.fixedBill.findMany({
            where: { userId, monthKey }
          });
        }
      }

      return res.status(200).json({ bills });
    } catch (err) {
      console.error('Get bills error:', err);
      return res.status(500).json({ error: 'Erro ao obter contas fixas.' });
    }
  } else if (req.method === 'POST') {
    const { id, paid, value, card } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID da conta é obrigatório.' });
    }

    try {
      const updated = await prisma.fixedBill.updateMany({
        where: { id, userId },
        data: {
          paid: paid !== undefined ? Boolean(paid) : undefined,
          value: value !== undefined ? parseFloat(value) : undefined,
          card: card !== undefined ? String(card) : undefined
        }
      });

      if (updated.count === 0) {
        return res.status(404).json({ error: 'Conta não encontrada ou não pertence ao usuário.' });
      }

      const bill = await prisma.fixedBill.findFirst({
        where: { id, userId }
      });

      return res.status(200).json({ bill });
    } catch (err) {
      console.error('Update bill error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar conta.' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
};
