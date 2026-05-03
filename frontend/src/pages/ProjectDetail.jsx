import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchProject(); fetchTasks(); if (isAdmin) fetchUsers(); }, [id]);

  const fetchProject = async () => {
    try { const { data } = await API.get(`/projects/${id}`); setProject(data); }
    catch { navigate('/projects'); }
    finally { setLoading(false); }
  };
  const fetchTasks = async () => {
    try { const { data } = await API.get('/tasks', { params: { projectId: id } }); setTasks(data); } catch {}
  };
  const fetchUsers = async () => {
    try { const { data } = await API.get('/auth/users'); setAllUsers(data); } catch {}
  };
  const handleAddMember = async () => {
    if (!selectedUser) return;
    try { await API.put(`/projects/${id}/members`, { members: [selectedUser], action: 'add' }); setSelectedUser(''); setShowAddMember(false); fetchProject(); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };
  const handleRemoveMember = async (userId) => {
    try { await API.put(`/projects/${id}/members`, { members: [userId], action: 'remove' }); fetchProject(); } catch {}
  };
  const statusBadge = (s) => ({ Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20', 'In Progress': 'bg-sky-500/15 text-sky-400 border-sky-500/20', Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' }[s] || '');

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const nonMembers = allUsers.filter(u => !project?.members?.some(m => m._id === u._id));

  return (
    <div>
      <Navbar title={project?.name || 'Project'} />
      <div className="p-8">
        <div className="animate-fade-in mb-8">
          <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Projects
          </button>
          {project?.description && <p className="text-sm text-surface-400 max-w-2xl">{project.description}</p>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="animate-fade-in">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Members</h3>
                {isAdmin && <button onClick={() => setShowAddMember(true)} id="add-member-btn" className="text-xs text-primary-400 hover:text-primary-300 font-medium">+ Add</button>}
              </div>
              {error && <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-3">{error}</div>}
              {showAddMember && isAdmin && (
                <div className="mb-4 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 space-y-2">
                  <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} id="select-new-member" className="w-full px-3 py-2 rounded-lg bg-surface-800/60 border border-surface-600/50 text-surface-200 text-sm focus:outline-none focus:border-primary-500">
                    <option value="">Select user...</option>
                    {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddMember(false)} className="flex-1 py-1.5 rounded-lg bg-surface-700/50 text-surface-400 text-xs">Cancel</button>
                    <button onClick={handleAddMember} id="confirm-add-member" className="flex-1 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium">Add</button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {project?.members?.map(m => (
                  <div key={m._id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white">{m.name?.charAt(0)?.toUpperCase()}</div>
                      <div><p className="text-sm text-surface-200">{m.name}</p><p className="text-[11px] text-surface-500">{m.role}</p></div>
                    </div>
                    {isAdmin && m._id !== project.createdBy?._id && (
                      <button onClick={() => handleRemoveMember(m._id)} className="text-surface-500 hover:text-red-400" title="Remove">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 animate-fade-in">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Tasks ({tasks.length})</h3>
              {tasks.length === 0 ? <p className="text-sm text-surface-500 py-6 text-center">No tasks yet.</p> : (
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task._id} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-800/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-200 truncate">{task.title}</p>
                        <p className="text-xs text-surface-500 mt-0.5">Assigned to {task.assignedTo?.name} · Due {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`ml-3 px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${statusBadge(task.status)}`}>{task.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
