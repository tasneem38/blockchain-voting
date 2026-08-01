import { useState } from 'react';
import { Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function VoterTable({ voters, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'voterId', dir: 'asc' });
  const [deleting, setDeleting] = useState(null);

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const filtered = voters
    .filter(v =>
      v.voterId?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(v.boothId)?.includes(search)
    )
    .sort((a, b) => {
      const va = a[sort.key] ?? '';
      const vb = b[sort.key] ?? '';
      return sort.dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  const handleDelete = async (id) => {
    if (!confirm('Delete this voter?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/voters/${id}`);
      toast.success('Voter deleted');
      onRefresh?.();
    } catch {
      toast.error('Failed to delete voter');
    } finally {
      setDeleting(null);
    }
  };

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sort.dir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />;
  };

  const cols = [
    { key: 'voterId',  label: 'Voter ID' },
    { key: 'email',    label: 'Email' },
    { key: 'boothId',  label: 'Booth' },
    { key: 'hasVoted', label: 'Voted' },
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
          placeholder="Search voters…"
          className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              {cols.map(({ key, label }) => (
                <th key={key}
                  onClick={() => toggleSort(key)}
                  className="text-left px-4 py-3 text-slate-400 font-semibold cursor-pointer hover:text-white select-none">
                  <span className="flex items-center gap-1.5">{label}<SortIcon col={key} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-slate-400 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">
                <LoadingSpinner size={24} className="mx-auto text-blue-400" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-500">No voters found</td></tr>
            ) : filtered.map((v, i) => (
              <tr key={v.id || v.voterId}
                className={`border-b border-slate-700/50 transition-colors hover:bg-slate-700/30 ${i % 2 === 0 ? '' : 'bg-slate-800/30'}`}>
                <td className="px-4 py-3 font-mono text-slate-200 font-semibold">{v.voterId}</td>
                <td className="px-4 py-3 text-slate-400">{v.email}</td>
                <td className="px-4 py-3 text-slate-400 font-mono">
                  {typeof v.boothId === 'object' ? v.boothId?.boothId : v.boothId}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${v.hasVoted ? 'bg-green-500/10 text-green-400' : 'bg-slate-600/30 text-slate-400'}`}>
                    {v.hasVoted ? 'Voted' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(v.id || v.voterId)}
                    disabled={!!deleting}
                    className="text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {deleting === (v.id || v.voterId)
                      ? <LoadingSpinner size={14} />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
