import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-surface-950/60 backdrop-blur-xl border-b border-surface-700/30">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-surface-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50">
            <div className={`w-2 h-2 rounded-full ${user?.role === 'Admin' ? 'bg-primary-400' : 'bg-success'}`} />
            <span className="text-xs font-medium text-surface-300">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
