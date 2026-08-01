import { AlertTriangle, X } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ConfirmVoteModal({ candidate, onCancel, onConfirm, loading }) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Confirm Your Vote
            </h2>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate info */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-5 text-center">
          <p className="text-slate-400 text-sm mb-1">You are voting for</p>
          <p className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
            {candidate.name}
          </p>
          <p className="text-blue-400 text-sm font-mono">{candidate.party}</p>
        </div>

        <p className="text-amber-400/80 text-xs text-center mb-5 leading-relaxed">
          ⚠ This action cannot be undone. Your vote will be permanently recorded on the blockchain.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><LoadingSpinner size={16} /> Submitting…</> : 'Confirm Vote'}
          </button>
        </div>
      </div>
    </div>
  );
}
