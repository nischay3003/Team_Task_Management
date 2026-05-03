import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       color: '#94a3b8', bg: '#f1f5f9' },
  IN_PROGRESS: { label: 'In Progress', color: '#6366f1', bg: '#eef2ff' },
  DONE:        { label: 'Done',        color: '#10b981', bg: '#d1fae5' },
};
const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: '#64748b', bg: '#f1f5f9' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7' },
  HIGH:   { label: 'High',   color: '#ef4444', bg: '#fee2e2' },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.TODO;
  return <span className="badge" style={{ color: c.color, background: c.bg }}>{c.label}</span>;
}
function PriorityDot({ priority }) {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return <span className="badge" style={{ color: c.color, background: c.bg }}>{c.label}</span>;
}

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [myRole, setMyRole] = useState('MEMBER');
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', dueDate: '', priority: 'MEDIUM', assigneeId: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = async () => {
    const [proj, dash] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/dashboard/${id}`)
    ]);
    setProject(proj.data.project);
    setMyRole(proj.data.myRole);
    setStats(dash.data);
  };

  useEffect(() => { load(); }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    await api.post('/tasks', { ...taskForm, projectId: id });
    setShowTaskForm(false);
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assigneeId: '' });
    load();
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    load();
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    load();
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setShowAddMember(false);
      setMemberEmail('');
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'User not found');
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${userId}`);
    load();
  };

  if (!project) {
    return (
      <div className="app-shell">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  const filteredTasks = project.tasks?.filter(t =>
    filterStatus === 'ALL' ? true : t.status === filterStatus
  ) || [];

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">⬡</div>
          <span>TaskFlow</span>
        </div>
        <nav className="sidebar-nav">
          <a className="nav-item" onClick={() => nav('/')} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            All Projects
          </a>
          <a className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            {project.name}
          </a>
        </nav>

        {/* Mini stats in sidebar */}
        {stats && (
          <div className="sidebar-stats">
            <div className="sidebar-stat">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">Total tasks</span>
            </div>
            <div className="sidebar-stat">
              <span className="stat-num" style={{ color: '#6366f1' }}>{stats.byStatus.IN_PROGRESS}</span>
              <span className="stat-label">In progress</span>
            </div>
            <div className="sidebar-stat">
              <span className="stat-num" style={{ color: '#ef4444' }}>{stats.overdue}</span>
              <span className="stat-label">Overdue</span>
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="avatar" style={{ background: '#6366f1' }}>{initials(user.name)}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{myRole}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { localStorage.clear(); nav('/login'); }} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="breadcrumb">
              <span onClick={() => nav('/')} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>Projects</span>
              <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>/</span>
              <span>{project.name}</span>
            </div>
            <h1 className="page-title">{project.name}</h1>
          </div>
          {myRole === 'ADMIN' && (
            <button className="btn-primary" onClick={() => setShowTaskForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Task
            </button>
          )}
        </header>

        {/* Stat cards */}
        {stats && (
          <div className="stat-cards">
            {[
              { label: 'Total Tasks', value: stats.total, icon: '📋', color: '#6366f1' },
              { label: 'To Do', value: stats.byStatus.TODO, icon: '⬜', color: '#94a3b8' },
              { label: 'In Progress', value: stats.byStatus.IN_PROGRESS, icon: '🔄', color: '#6366f1' },
              { label: 'Done', value: stats.byStatus.DONE, icon: '✅', color: '#10b981' },
              { label: 'Overdue', value: stats.overdue, icon: '⚠️', color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {['tasks', 'members'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'tasks' ? `Tasks (${project.tasks?.length || 0})` : `Members (${project.members?.length || 0})`}
            </button>
          ))}
        </div>

        {activeTab === 'tasks' && (
          <div>
            {/* Filter bar */}
            <div className="filter-bar">
              {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(s => (
                <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
                  onClick={() => setFilterStatus(s)}>
                  {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>

            {filteredTasks.length === 0 ? (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <div className="empty-icon">✅</div>
                <h3>No tasks here</h3>
                <p>{myRole === 'ADMIN' ? 'Create the first task for this project' : 'No tasks match this filter'}</p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map(task => {
                  const overdue = isOverdue(task);
                  const isAssignee = task.assigneeId === user.id;
                  const canUpdate = myRole === 'ADMIN' || isAssignee;
                  return (
                    <div key={task.id} className={`task-card ${overdue ? 'overdue' : ''}`}>
                      <div className="task-card-left">
                        <div className="task-status-dot" style={{ background: STATUS_CONFIG[task.status]?.color || '#94a3b8' }} />
                        <div className="task-body">
                          <div className="task-title">
                            {task.title}
                            {overdue && <span className="overdue-chip">Overdue</span>}
                          </div>
                          {task.description && <p className="task-desc">{task.description}</p>}
                          <div className="task-chips">
                            <StatusBadge status={task.status} />
                            <PriorityDot priority={task.priority} />
                            {task.assignee && (
                              <span className="assignee-chip">
                                <span className="mini-avatar">{initials(task.assignee.name)}</span>
                                {task.assignee.name}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="date-chip" style={{ color: overdue ? '#ef4444' : 'var(--text-muted)' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="task-card-actions">
                        {canUpdate && (
                          <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                            className="status-select">
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        )}
                        {myRole === 'ADMIN' && (
                          <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-section">
            {myRole === 'ADMIN' && (
              <div className="members-header">
                <p className="members-hint">Add members by their registered email address.</p>
                <button className="btn-primary" onClick={() => setShowAddMember(true)}>+ Add Member</button>
              </div>
            )}

            {showAddMember && (
              <form onSubmit={addMember} className="add-member-form">
                <input
                  placeholder="member@email.com"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  type="email"
                  required
                />
                <button type="submit" className="btn-primary">Add</button>
                <button type="button" className="btn-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
              </form>
            )}

            <div className="members-list">
              {project.members?.map(m => (
                <div key={m.id} className="member-row">
                  <div className="member-avatar" style={{ background: m.role === 'ADMIN' ? '#6366f1' : '#94a3b8' }}>
                    {initials(m.user.name)}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{m.user.name}</span>
                    <span className="member-email">{m.user.email}</span>
                  </div>
                  <span className={`role-badge ${m.role === 'ADMIN' ? 'admin' : 'member'}`}>{m.role}</span>
                  {myRole === 'ADMIN' && m.user.id !== user.id && (
                    <button className="delete-btn" onClick={() => removeMember(m.user.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Per-user task breakdown */}
            {stats && Object.keys(stats.byUser).length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tasks per member</h3>
                <div className="byuser-list">
                  {Object.entries(stats.byUser).map(([name, count]) => (
                    <div key={name} className="byuser-row">
                      <span className="byuser-name">{name}</span>
                      <div className="byuser-bar-wrap">
                        <div className="byuser-bar" style={{ width: `${(count / stats.total) * 100}%` }} />
                      </div>
                      <span className="byuser-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create task modal */}
      {showTaskForm && (
        <div className="modal-overlay" onClick={() => setShowTaskForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Task</h3>
              <button onClick={() => setShowTaskForm(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={createTask} className="modal-form">
              <div className="field">
                <label>Title</label>
                <input placeholder="Task title" value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div className="field">
                <label>Description <span className="optional">optional</span></label>
                <textarea placeholder="What needs to be done?" value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Due date</label>
                  <input type="date" value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Assign to</label>
                <select value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowTaskForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
