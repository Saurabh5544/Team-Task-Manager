import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const params = selectedProject ? { projectId: selectedProject } : {};
      const { data } = await API.get('/tasks/stats', { params });
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = selectedProject ? { projectId: selectedProject } : {};
      const { data } = await API.get('/tasks', { params });
      setRecentTasks(data.slice(0, 8));
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const statusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      'In Progress': 'bg-sky-500/15 text-sky-400 border-sky-500/20',
      Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    };
    return map[status] || map.Pending;
  };

  const isOverdue = (task) =>
    task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <div>
      <Navbar title="Dashboard" />

      <div className="p-8">
        {/* Project filter */}
        <div className="mb-8 animate-fade-in">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            id="dashboard-project-filter"
            className="px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-600/50 text-surface-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all min-w-[220px]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <StatsCard
            title="Total Tasks"
            value={loading ? '—' : stats.total}
            delay={0}
            color="primary"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatsCard
            title="Completed"
            value={loading ? '—' : stats.completed}
            delay={80}
            color="success"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Pending"
            value={loading ? '—' : stats.pending}
            delay={160}
            color="warning"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Overdue"
            value={loading ? '—' : stats.overdue}
            delay={240}
            color="danger"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.832c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />
        </div>

        {/* Recent tasks */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <svg className="w-12 h-12 text-surface-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-surface-500 text-sm">No tasks yet. Start by creating a project and assigning tasks.</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-700/50">
                    <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-6 py-3">Task</th>
                    <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-6 py-3">Project</th>
                    <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-6 py-3">Assigned To</th>
                    <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-6 py-3">Due Date</th>
                    <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/30">
                  {recentTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-surface-200">{task.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-surface-400">{task.projectId?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-surface-400">{task.assignedTo?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${isOverdue(task) ? 'text-red-400 font-medium' : 'text-surface-400'}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task) && ' ⚠'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${statusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
