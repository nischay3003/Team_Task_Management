const router = require('express').Router();
const auth = require('../../middleware/auth');
const prisma = require('../db');

// Get all projects for current user
router.get('/', auth, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.user.id } } },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } }, _count: { select: { tasks: true } } }
  });
  res.json(projects);
});

// Create project (creator becomes ADMIN)
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const project = await prisma.project.create({
    data: {
      name, description,
      members: { create: { userId: req.user.id, role: 'ADMIN' } }
    },
    include: { members: true }
  });
  res.json(project);
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId: req.params.id, userId: req.user.id }
  });
  if (!member) return res.status(403).json({ error: 'Not a member' });
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: { include: { assignee: { select: { id: true, name: true } } } }
    }
  });
  res.json({ project, myRole: member.role });
});

// Add member (ADMIN only)
router.post('/:id/members', auth, async (req, res) => {
  const admin = await prisma.projectMember.findFirst({
    where: { projectId: req.params.id, userId: req.user.id, role: 'ADMIN' }
  });
  if (!admin) return res.status(403).json({ error: 'Admin only' });
  const { email, role = 'MEMBER' } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const membership = await prisma.projectMember.upsert({
    where: { userId_projectId: { userId: user.id, projectId: req.params.id } },
    update: { role },
    create: { userId: user.id, projectId: req.params.id, role }
  });
  res.json(membership);
});

// Remove member (ADMIN only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  const admin = await prisma.projectMember.findFirst({
    where: { projectId: req.params.id, userId: req.user.id, role: 'ADMIN' }
  });
  if (!admin) return res.status(403).json({ error: 'Admin only' });
  await prisma.projectMember.deleteMany({
    where: { projectId: req.params.id, userId: req.params.userId }
  });
  res.json({ success: true });
});

module.exports = router;