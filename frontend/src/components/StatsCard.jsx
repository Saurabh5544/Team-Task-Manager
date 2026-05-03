const StatsCard = ({ title, value, icon, color = 'primary', delay = 0 }) => {
  const colorMap = {
    primary: {
      bg: 'from-primary-500/20 to-primary-600/10',
      border: 'border-primary-500/20',
      icon: 'text-primary-400',
      value: 'text-primary-300',
    },
    success: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
      value: 'text-emerald-300',
    },
    warning: {
      bg: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
      value: 'text-amber-300',
    },
    danger: {
      bg: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/20',
      icon: 'text-red-400',
      value: 'text-red-300',
    },
    info: {
      bg: 'from-sky-500/20 to-sky-600/10',
      border: 'border-sky-500/20',
      icon: 'text-sky-400',
      value: 'text-sky-300',
    },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`animate-fade-in rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-6 transition-all duration-300 hover:scale-[1.02]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-400 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${c.value}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-surface-800/50 ${c.icon}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
