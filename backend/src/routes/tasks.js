const router = require('express').Router();
const auth = require('../../middleware/auth');
const prisma = require('../db');


// ✅ Get all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.user.id
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: {
        assignee: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ✅ Create task (ADMIN only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and projectId required' });
    }

    const admin = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: req.user.id,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      return res.status(403).json({ error: 'Admin only' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        projectId,
        assigneeId
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    res.json(task);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ✅ Update task status (member can update ONLY own task)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: req.user.id
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member' });
    }

    // 🔥 Important logic
    if (member.role === 'MEMBER' && task.assigneeId !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own tasks' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(updated);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ✅ Full update task (ADMIN only)
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const admin = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: req.user.id,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { title, description, dueDate, priority, assigneeId, status } = req.body;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        assigneeId,
        status
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    res.json(updated);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ✅ Delete task (ADMIN only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const admin = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: req.user.id,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      return res.status(403).json({ error: 'Admin only' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = router;