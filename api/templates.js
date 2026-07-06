import { prisma, authenticate } from './_db.js';

export default async (req, res) => {
  const userId = await authenticate(req, res);
  if (!userId) return;

  if (req.method === 'GET') {
    try {
      const templates = await prisma.fixedBillTemplate.findMany({
        where: { userId }
      });
      return res.status(200).json({ templates });
    } catch (err) {
      console.error('Get templates error:', err);
      return res.status(500).json({ error: 'Erro ao obter templates de contas.' });
    }
  } else if (req.method === 'POST') {
    const { templates } = req.body;
    if (!Array.isArray(templates)) {
      return res.status(400).json({ error: 'Templates deve ser uma lista.' });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.fixedBillTemplate.deleteMany({
          where: { userId }
        });

        if (templates.length > 0) {
          await tx.fixedBillTemplate.createMany({
            data: templates.map(t => ({
              userId,
              name: t.name,
              value: parseFloat(t.value) || 0,
              dueDate: String(t.dueDate || t.due_date),
              card: t.card
            }))
          });
        }

        return tx.fixedBillTemplate.findMany({
          where: { userId }
        });
      });

      return res.status(200).json({ templates: result });
    } catch (err) {
      console.error('Update templates error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar templates.' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
};
