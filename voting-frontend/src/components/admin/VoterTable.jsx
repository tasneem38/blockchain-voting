import { useState } from 'react';
import { Trash2, Search, ChevronUp, ChevronDown, RotateCcw, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function VoterTable({ voters, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'voterId', dir: 'asc' });
  const [deleting, setDeleting] = useState(null);
  const [resetting, setResetting] = useState(null);

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const filtered = voters
    .filter(v =>
      v.voterId?.toLowerCase().includes(search.toLowerCase()) ||
      v.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      v.epicNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(v.boothId?.boothId || v.boothId)?.includes(search)
    )
    .sort((a, b) => {
      const va = a[sort.key] ?? '';
      const vb = b[sort.key] ?? '';
      return sort.dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  const handleDelete = async (id) => {
    if (!confirm('Delete this voter record?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/voters/${id}`);
      toast.success('Voter deleted');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete voter');
    } finally {
      setDeleting(null);
    }
  };

  const handleReset = async (id) => {
    if (!confirm('Reset voting status and unlock this voter?')) return;
    setResetting(id);
    try {
      await api.patch(`/admin/voters/${id}/reset`);
      toast.success('Voter status & lockout reset');
      onRefresh?.();
    } catch (err) {
      toast.error('Failed to reset voter');
    } finally {
      setResetting(null);
    }
  };

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sort.dir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />;
  };

  const cols = [
    { key: 'voterId',    label: 'Voter ID & EPIC' },
    { key: 'fullName',   label: 'Name / Email' },
    { key: 'boothId',    label: 'Polling Station' },
    { key: 'hasVoted',   label: 'Status' },
  ];

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Voter ID, EPIC (KA/01/172/...), Name, or Email…"
          className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/60">
              {cols.map(({ key, label }) => (
                <th key={key}
                  onClick={() => toggleSort(key)}
                  className="text-left px-4 py-3.5 text-slate-400 font-semibold cursor-pointer hover:text-white select-none">
                  <span className="flex items-center gap-1.5">{label}<SortIcon col={key} /></span>
                </th>
              ))}
              <th className="px-4 py-3.5 text-slate-400 font-semibold text-right">Officer Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12">
                <LoadingSpinner size={24} className="mx-auto text-blue-400" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No voters found</td></tr>
            ) : filtered.map((v, i) => {
              const vId = v._id || v.id;
              return (
                <tr key={vId || v.voterId}
                  className={`border-b border-slate-700/50 transition-colors hover:bg-slate-700/30 ${i % 2 === 0 ? '' : 'bg-slate-800/30'}`}>
                  <td className="px-4 py-3 font-mono">
                    <div className="text-slate-100 font-bold">{v.voterId}</div>
                    <div className="text-slate-500 text-xs">{v.epicNumber || `KA/01/172/${v.voterId}`}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-200 font-medium">{v.fullName || 'Registered Voter'}</div>
                    <div className="text-slate-400 text-xs">{v.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="font-mono text-xs text-blue-400 font-semibold">
                      {typeof v.boothId === 'object' ? v.boothId?.boothId : v.boothId}
                    </div>
                    <div className="text-slate-400 text-xs truncate max-w-xs">
                      {typeof v.boothId === 'object' ? v.boothId?.location : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${v.hasVoted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/50 text-slate-400'}`}>
                        {v.hasVoted ? 'Voted' : 'Pending'}
                      </span>
                      {v.isLocked && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReset(vId)}
                        disabled={resetting === vId}
                        title="Reset Voting Status / Unlock Account"
                        className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors border border-amber-500/20"
                      >
                        {resetting === vId ? <LoadingSpinner size={14} /> : <RotateCcw className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(vId)}
                        disabled={deleting === vId || v.hasVoted}
                        title={v.hasVoted ? 'Cannot delete voter who has voted' : 'Delete Voter'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        {deleting === vId ? <LoadingSpinner size={14} /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
