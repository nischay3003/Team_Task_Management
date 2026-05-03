import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      setLoading(false);
    });
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/projects', form);
    setProjects([data, ...projects]);
    setShowForm(false);
    setForm({ name: '', description: '' });
  };

  const logout = () => { localStorage.clear(); nav('/login'); };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981'];
  const projectColor = (i) => colors[i % colors.length];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">⬡</div>
          <span>TaskFlow</span>
        </div>
        <nav className="sidebar-nav">
          <a className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            All Projects
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="avatar" style={{ background: '#6366f1' }}>{initials(user.name)}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-sub">{projects.length} workspace{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
        </header>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create Project</h3>
                <button onClick={() => setShowForm(false)} className="modal-close">×</button>
              </div>
              <form onSubmit={create} className="modal-form">
                <div className="field">
                  <label>Project name</label>
                  <input placeholder="e.g. Website Redesign" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Description <span className="optional">optional</span></label>
                  <textarea placeholder="What is this project about?" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>Create Project</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p, i) => (
              <div key={p.id} className="project-card" onClick={() => nav(`/project/${p.id}`)}>
                <div className="project-card-top" style={{ background: projectColor(i) }}>
                  <span className="project-initial">{p.name[0].toUpperCase()}</span>
                </div>
                <div className="project-card-body">
                  <h3 className="project-name">{p.name}</h3>
                  {p.description && <p className="project-desc">{p.description}</p>}
                  <div className="project-meta">
                    <span className="meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                      {p.members?.length || 0} member{(p.members?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                      {p._count?.tasks || 0} task{(p._count?.tasks || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
