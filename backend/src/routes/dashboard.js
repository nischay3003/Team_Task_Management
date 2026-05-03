const router = require('express').Router();
const auth = require('../../middleware/auth');
const prisma = require('../db');

router.get('/:projectId', auth, async (req, res) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: req.params.projectId, userId: req.user.id }
  });
  if (!member) return res.status(403).json({ error: 'Not a member' });

  const tasks = await prisma.task.findMany({
    where: { projectId: req.params.projectId },
    include: { assignee: { select: { id: true, name: true } } }
  });

  const now = new Date();
  const byStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  const byUser = {};
  let overdue = 0;

  tasks.forEach(t => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    if (t.assignee) {
      byUser[t.assignee.name] = (byUser[t.assignee.name] || 0) + 1;
    }
    if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE') overdue++;
  });

  res.json({ total: tasks.length, byStatus, byUser, overdue });
});

module.exports = router;