import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const ACTION_TYPES = ['ALL', 'VOTE_CAST', 'LOGIN', 'LOGOUT', 'VOTER_ADDED', 'VOTER_DELETED', 'ELECTION_OPENED', 'ELECTION_CLOSED'];

const statusColor = (s) => {
  switch (s) {
    case 'SUCCESS': return 'text-green-400 bg-green-400/10';
    case 'FAILED':  return 'text-red-400 bg-red-400/10';
    default:        return 'text-slate-400 bg-slate-400/10';
  }
};

export default function AuditLogTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('ALL');
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (action !== 'ALL') params.action = action;
      const res = await api.get('/admin/audit', { params });
      setLogs(res.data.logs || res.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1); }}
          className="bg-slate-900 border border-slate-700 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-slate-500 text-sm ml-auto font-mono">{total} records</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              {['Timestamp', 'Action', 'Actor', 'Booth', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">
                <LoadingSpinner size={24} className="mx-auto text-blue-400" />
              </td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-500">No audit logs found</td></tr>
            ) : logs.map((log, i) => (
              <tr key={log.id || i}
                className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${i % 2 ? 'bg-slate-800/20' : ''}`}>
                <td className="px-4 py-3 font-mono text-slate-400 text-xs whitespace-nowrap">{formatDate(log.timestamp)}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded">{log.action}</span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-300 text-xs">{log.actor}</td>
                <td className="px-4 py-3 text-slate-400 text-xs font-mono">{log.booth ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(log.status)}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-slate-500 text-sm font-mono">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
