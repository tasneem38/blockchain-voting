import LoadingSpinner from '../shared/LoadingSpinner';

export default function MetricCard({ label, value, icon: Icon, color = 'blue', loading }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400',   val: 'text-blue-300' },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400',  val: 'text-green-300' },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  val: 'text-amber-300' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', val: 'text-purple-300' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-slate-800 border ${c.border} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`${c.bg} p-3 rounded-xl shrink-0`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        {loading
          ? <LoadingSpinner size={20} className="text-slate-400 mt-1" />
          : <p className={`text-2xl font-extrabold ${c.val}`} style={{ fontFamily: 'Syne, sans-serif' }}>
              {value ?? '—'}
            </p>
        }
      </div>
    </div>
  );
}
