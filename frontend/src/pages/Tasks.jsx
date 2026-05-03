import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', projectId: '', dueDate: '' });

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchTasks(); }, [filterProject, filterStatus]);

  const fetchProjects = async () => {
    try { const { data } = await API.get('/projects'); setProjects(data); } catch {}
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filterProject) params.projectId = filterProject;
      if (filterStatus) params.status = filterStatus;
      const { data } = await API.get('/tasks', { params });
      setTasks(data);
    } catch {} finally { setLoading(false); }
  };

  const handleProjectChange = (projectId) => {
    setForm({ ...form, projectId, assignedTo: '' });
    const proj = projects.find(p => p._id === projectId);
    setMembers(proj?.members || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await API.post('/tasks', form);
      setShowModal(false);
      setForm({ title: '', description: '', assignedTo: '', projectId: '', dueDate: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally { setCreating(false); }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const statusBadge = (s) => ({
    Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'In Progress': 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  }[s] || '');

  const isOverdue = (task) => task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <div>
      <Navbar title="Tasks" />
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex flex-wrap gap-3">
            <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} id="task-filter-project"
              className="px-4 py-2 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-200 text-sm focus:outline-none focus:border-primary-500 transition-all">
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} id="task-filter-status"
              className="px-4 py-2 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-200 text-sm focus:outline-none focus:border-primary-500 transition-all">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} id="create-task-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 transition-all hover:shadow-lg hover:shadow-primary-500/25">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          )}
        </div>

        {/* Tasks list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center animate-fade-in">
            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-lg font-semibold text-surface-300 mb-2">No tasks found</h3>
            <p className="text-surface-500 text-sm">Adjust your filters or create new tasks.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div key={task._id} className="glass-card rounded-2xl p-5 animate-fade-in transition-all hover:scale-[1.005]" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white truncate">{task.title}</h4>
                      {isOverdue(task) && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20">OVERDUE</span>}
                    </div>
                    {task.description && <p className="text-xs text-surface-400 mb-2 line-clamp-1">{task.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        {task.projectId?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {task.assignedTo?.name}
                      </span>
                      <span className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-400' : ''}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={task.status} onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none transition-all ${statusBadge(task.status)}`}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card rounded-2xl p-8 animate-fade-in mx-4">
            <h2 className="text-xl font-bold text-white mb-6">New Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-surface-300 mb-1.5">Title</label>
                <input id="task-title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Task title"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all" />
              </div>
              <div>
                <label htmlFor="task-desc" className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea id="task-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-project" className="block text-sm font-medium text-surface-300 mb-1.5">Project</label>
                  <select id="task-project" value={form.projectId} onChange={(e) => handleProjectChange(e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-100 focus:outline-none focus:border-primary-500 transition-all">
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="task-assignee" className="block text-sm font-medium text-surface-300 mb-1.5">Assign To</label>
                  <select id="task-assignee" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-100 focus:outline-none focus:border-primary-500 transition-all">
                    <option value="">Select member</option>
                    {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="task-due" className="block text-sm font-medium text-surface-300 mb-1.5">Due Date</label>
                <input id="task-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-surface-700/50 text-surface-300 text-sm font-medium hover:bg-surface-600/50 transition-all">Cancel</button>
                <button type="submit" disabled={creating} id="create-task-submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 transition-all">
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
