import { prisma, authenticate } from './_db.js';

export default async (req, res) => {
  const userId = await authenticate(req, res);
  if (!userId) return;

  if (req.method === 'GET') {
    try {
      const dbExpenses = await prisma.dailyExpense.findMany({
        where: { userId }
      });

      const expenses = dbExpenses.map(exp => ({
        id: exp.id,
        amount: exp.amount,
        date: exp.date,
        desc: exp.desc,
        category: exp.category,
        card: exp.card,
        specify: exp.specify || '',
        installmentGroupId: exp.installmentGroupId,
        installmentIndex: exp.installmentIndex,
        installmentCount: exp.installmentCount,
        tags: exp.tags || []
      }));

      return res.status(200).json({ expenses });
    } catch (err) {
      console.error('Get expenses error:', err);
      return res.status(500).json({ error: 'Erro ao obter lançamentos.' });
    }
  } else if (req.method === 'POST') {
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Ação (action) é obrigatória.' });
    }

    try {
      if (action === 'insert') {
        const { expenses } = req.body;
        if (!Array.isArray(expenses)) {
          return res.status(400).json({ error: 'Despesas para inserção devem ser uma lista.' });
        }

        if (expenses.length > 0) {
          const data = expenses.map(e => ({
            id: e.id,
            userId,
            amount: parseFloat(e.amount || e.value) || 0,
            date: e.date,
            desc: e.desc,
            category: e.category,
            card: e.card,
            specify: e.specify || '',
            installmentGroupId: e.installmentGroupId || e.installment_group_id,
            installmentIndex: e.installmentIndex !== undefined ? parseInt(e.installmentIndex) : (e.installment_index !== undefined ? parseInt(e.installment_index) : null),
            installmentCount: e.installmentCount !== undefined ? parseInt(e.installmentCount) : (e.installment_count !== undefined ? parseInt(e.installment_count) : null),
            tags: e.tags || []
          }));

          await prisma.dailyExpense.createMany({ data });
        }

        return res.status(201).json({ message: 'Lançamentos inseridos com sucesso!' });
      } 
      
      else if (action === 'update') {
        const { id, amount, date, desc, category, card, specify, tags } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'ID do lançamento é obrigatório para atualização.' });
        }

        await prisma.dailyExpense.updateMany({
          where: { id, userId },
          data: {
            amount: amount !== undefined ? parseFloat(amount) : undefined,
            date,
            desc,
            category,
            card,
            specify,
            tags
          }
        });

        return res.status(200).json({ message: 'Lançamento atualizado com sucesso!' });
      } 
      
      else if (action === 'delete') {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'ID do lançamento é obrigatório para deleção.' });
        }

        const idFilter = Array.isArray(id) ? { in: id } : id;

        await prisma.dailyExpense.deleteMany({
          where: { id: idFilter, userId }
        });

        return res.status(200).json({ message: 'Lançamento excluído com sucesso!' });
      } 
      
      else if (action === 'deleteGroup') {
        const { installmentGroupId } = req.body;
        if (!installmentGroupId) {
          return res.status(400).json({ error: 'Grupo de parcelamento (installmentGroupId) é obrigatório.' });
        }

        await prisma.dailyExpense.deleteMany({
          where: { installmentGroupId, userId }
        });

        return res.status(200).json({ message: 'Grupo de parcelamento excluído com sucesso!' });
      } 
      
      else {
        return res.status(400).json({ error: 'Ação inválida.' });
      }
    } catch (err) {
      console.error('Transactions write error:', err);
      return res.status(500).json({ error: 'Erro ao processar alteração de lançamento.' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
};
