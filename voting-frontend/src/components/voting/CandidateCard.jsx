import { Check } from 'lucide-react';

export default function CandidateCard({ candidate, selected, onClick }) {
  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 group
        hover:scale-[1.02] active:scale-100
        ${selected
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700/60'
        }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Avatar / Party Symbol */}
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-xl font-bold mx-auto
        ${selected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
        {candidate.symbolUrl
          ? <img src={candidate.symbolUrl} alt={candidate.party} className="w-full h-full object-cover rounded-xl" />
          : <span style={{ fontFamily: 'Syne, sans-serif' }}>{initials}</span>
        }
      </div>

      <div className="text-center">
        <h3 className={`font-bold text-base leading-tight mb-1 ${selected ? 'text-white' : 'text-slate-200'}`}
          style={{ fontFamily: 'Syne, sans-serif' }}>
          {candidate.name}
        </h3>
        <p className={`text-sm font-mono ${selected ? 'text-blue-300' : 'text-slate-400'}`}>
          {candidate.party}
        </p>
        {candidate.boothId && (
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Booth {typeof candidate.boothId === 'object' ? candidate.boothId.location : candidate.boothId}
          </p>
        )}
      </div>
    </button>
  );
}
