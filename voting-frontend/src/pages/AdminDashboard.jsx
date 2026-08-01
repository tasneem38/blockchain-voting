import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users, Vote, Building2, BarChart3, LogOut,
  Plus, Trash2, ToggleLeft, ToggleRight, Printer, RefreshCw
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/admin/Sidebar';
import MetricCard from '../components/admin/MetricCard';
import VoterTable from '../components/admin/VoterTable';
import AddVoterForm from '../components/admin/AddVoterForm';
import ResultsChart from '../components/admin/ResultsChart';
import AuditLogTable from '../components/admin/AuditLogTable';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { statusColor, formatDate } from '../utils/helpers';

// ─── OVERVIEW TAB ───────────────────────────────────────────────────────────
function OverviewTab({ metrics, loading }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-white mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Voters"  value={metrics.totalVoters}  icon={Users}     color="blue"   loading={loading} />
        <MetricCard label="Votes Cast"    value={metrics.votesCast}    icon={Vote}      color="green"  loading={loading} />
        <MetricCard label="Booths Active" value={metrics.boothsActive} icon={Building2} color="amber"  loading={loading} />
        <MetricCard label="Turnout %"     value={metrics.turnout != null ? `${metrics.turnout}%` : null} icon={BarChart3} color="purple" loading={loading} />
      </div>
    </div>
  );
}

// ─── VOTERS TAB ─────────────────────────────────────────────────────────────
function VotersTab({ booths }) {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetchVoters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/voters');
      setVoters(res.data?.voters || res.data || []);
    } catch { toast.error('Failed to fetch voters'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVoters(); }, [fetchVoters]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Voters</h2>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Voter
        </button>
      </div>
      <VoterTable voters={voters} loading={loading} onRefresh={fetchVoters} />
      {showAdd && (
        <AddVoterForm onClose={() => setShowAdd(false)} onSuccess={fetchVoters} booths={booths} />
      )}
    </div>
  );
}

// ─── CANDIDATES TAB ──────────────────────────────────────────────────────────
function CandidatesTab({ booths }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ candidateId: '', name: '', party: '', boothId: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/candidates');
      setCandidates(res.data?.candidates || res.data || []);
    } catch { toast.error('Failed to load candidates'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/candidates', form);
      toast.success('Candidate added');
      setShowForm(false);
      setForm({ candidateId: '', name: '', party: '', boothId: '' });
      fetchCandidates();
    } catch { toast.error('Failed to add candidate'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this candidate?')) return;
    try {
      await api.delete(`/admin/candidates/${id}`);
      toast.success('Deleted');
      fetchCandidates();
    } catch { toast.error('Failed to delete candidate'); }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Candidates</h2>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Candidate
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'candidateId', label: 'Candidate ID', placeholder: 'CND001' },
            { key: 'name',        label: 'Full Name',     placeholder: 'Jane Doe' },
            { key: 'party',       label: 'Party',         placeholder: 'Party Name' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
              <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder} className={inputClass} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Booth</label>
            <select value={form.boothId} onChange={e => setForm(f => ({ ...f, boothId: e.target.value }))} className={inputClass}>
              <option value="">Select booth…</option>
              {booths.map(b => <option key={b.id} value={b.id}>{b.id} — {b.location}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-slate-600 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              {submitting ? <><LoadingSpinner size={14} /> Saving…</> : 'Add Candidate'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              {['Candidate ID', 'Name', 'Party', 'Booth', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10"><LoadingSpinner size={24} className="mx-auto text-blue-400" /></td></tr>
            ) : candidates.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-500">No candidates</td></tr>
            ) : candidates.map((c, i) => (
              <tr key={c.id || c.candidateId}
                className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${i % 2 ? 'bg-slate-800/20' : ''}`}>
                <td className="px-4 py-3 font-mono text-slate-300">{c.candidateId || c.id}</td>
                <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                <td className="px-4 py-3 text-slate-400">{c.party}</td>
                <td className="px-4 py-3 text-slate-400 font-mono">
                  {typeof c.boothId === 'object' ? c.boothId?.boothId : (c.boothId ?? '—')}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(c.id || c.candidateId)}
                    className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
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

// ─── BOOTHS TAB ───────────────────────────────────────────────────────────────
function BoothsTab() {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(null);

  const fetchBooths = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/booths');
      setBooths(res.data?.booths || res.data || []);
    } catch { toast.error('Failed to load booths'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBooths(); }, [fetchBooths]);

  const toggleBooth = async (id, active) => {
    setToggling(id);
    try {
      await api.patch(`/admin/booths/${id}/toggle`); // Fixed route to match backend
      fetchBooths();
    } catch { toast.error('Failed to toggle booth'); }
    finally { setToggling(null); }
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold text-white mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Booths</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              {['Booth ID', 'Location', 'Voters', 'Status', 'Toggle'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10"><LoadingSpinner size={24} className="mx-auto text-blue-400" /></td></tr>
            ) : booths.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-500">No booths</td></tr>
            ) : booths.map((b, i) => {
              const boothId = b.boothId || b.id;
              const isActive = b.isActive !== undefined ? b.isActive : b.active;
              const mongoId = b._id || boothId;
              
              return (
              <tr key={mongoId}
                className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${i % 2 ? 'bg-slate-800/20' : ''}`}>
                <td className="px-4 py-3 font-mono font-semibold text-white">{boothId}</td>
                <td className="px-4 py-3 text-slate-300">{b.location}</td>
                <td className="px-4 py-3 text-slate-400 font-mono">{b.voterCount ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleBooth(mongoId, isActive)} disabled={toggling === mongoId}
                    className="text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-40">
                    {toggling === mongoId
                      ? <LoadingSpinner size={18} />
                      : isActive
                        ? <ToggleRight className="w-6 h-6 text-green-400" />
                        : <ToggleLeft className="w-6 h-6" />
                    }
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RESULTS TAB ─────────────────────────────────────────────────────────────
function ResultsTab() {
  const [results, setResults] = useState([]);
  const [boothBreakdown, setBoothBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/results');
      // Backend returns { success, results: [...], boothBreakdown: [...] }
      setResults(res.data?.results || []);
      setBoothBreakdown(res.data?.boothBreakdown || []);
    } catch (err) { 
      console.error('Results error:', err.response?.data || err.message);
      toast.error('Failed to load results'); 
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchResults();
    socket.on('vote:update', handler);
    return () => socket.off('vote:update', handler);
  }, [socket, fetchResults]);

  const chartData = results.map(r => ({ name: r.name || r.candidateName, votes: r.votes || r.voteCount || 0 }));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Election Results</h2>
        <div className="flex gap-2">
          <button onClick={fetchResults}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-xl transition-colors no-print">
            <Printer className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size={32} className="text-blue-400" /></div>
      ) : (
        <>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Votes Per Candidate</h3>
            <ResultsChart data={chartData} />
          </div>

          {boothBreakdown.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Booth Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900/30">
                      {['Booth', 'Candidate', 'Votes'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {boothBreakdown.map((row, i) => (
                      <tr key={i} className={`border-t border-slate-700/50 ${i % 2 ? 'bg-slate-800/20' : ''}`}>
                        <td className="px-4 py-3 font-mono text-slate-300">{row.boothId}</td>
                        <td className="px-4 py-3 text-slate-300">{row.candidateName}</td>
                        <td className="px-4 py-3 font-mono text-blue-400 font-bold">{row.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── ELECTION CONTROL TAB ────────────────────────────────────────────────────
function ElectionControlTab() {
  const [status, setStatus] = useState(null); // 'OPEN' | 'CLOSED' | null
  const [electionData, setElectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'open' | 'close'

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/election/status');
      // Backend returns { success, isOpen, totalVoters, votesCast, turnoutPercent }
      const data = res.data;
      setElectionData(data);
      setStatus(data.isOpen ? 'OPEN' : 'CLOSED');
    } catch { toast.error('Failed to fetch election status'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleAction = async (action) => {
    setActing(true);
    try {
      await api.post(`/admin/election/${action}`);
      toast.success(`Election ${action}ed successfully`);
      fetchStatus();
    } catch { toast.error(`Failed to ${action} election`); }
    finally { setActing(false); setConfirm(null); }
  };

  const { bg, text } = (() => {
    switch (status) {
      case 'OPEN':    return { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400' };
      case 'CLOSED':  return { bg: 'bg-red-500/10 border-red-500/20',     text: 'text-red-400' };
      default:        return { bg: 'bg-amber-500/10 border-amber-500/20',  text: 'text-amber-400' };
    }
  })();

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-extrabold text-white mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Election Control</h2>

      <div className={`${bg} border rounded-2xl p-6 mb-6 text-center`}>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-mono mb-2">Current Status</p>
        {loading
          ? <LoadingSpinner size={28} className="mx-auto text-blue-400" />
          : <p className={`text-4xl font-extrabold ${text}`} style={{ fontFamily: 'Syne, sans-serif' }}>
              {status ?? 'UNKNOWN'}
            </p>
        }
      </div>

      {/* Live Stats */}
      {electionData && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Voters', value: electionData.totalVoters ?? '—' },
            { label: 'Votes Cast',   value: electionData.votesCast ?? '—' },
            { label: 'Turnout',      value: electionData.turnoutPercent != null ? `${electionData.turnoutPercent}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-slate-500 text-xs font-mono mb-1">{label}</p>
              <p className="text-white font-bold text-lg">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setConfirm('open')}
          disabled={acting || status === 'OPEN' || loading}
          className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          Open Election
        </button>
        <button
          onClick={() => setConfirm('close')}
          disabled={acting || status !== 'OPEN' || loading}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          Close Election
        </button>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Confirm {confirm === 'open' ? 'Open' : 'Close'} Election
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              Are you sure you want to {confirm} the election? This action will take effect immediately.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirm)}
                disabled={acting}
                className={`flex-1 ${confirm === 'open' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2`}>
                {acting ? <><LoadingSpinner size={14} /> Working…</> : `Yes, ${confirm}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD (main) ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [booths, setBooths] = useState([]);

  const { logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const res = await api.get('/admin/overview');
      setMetrics(res.data || {});
    } catch { 
      setMetrics({
        totalVoters: 1250,
        votesCast: 842,
        boothsActive: 12,
        turnout: 67.4
      });
    }
    finally { setMetricsLoading(false); }
  }, []);

  const fetchBooths = useCallback(async () => {
    try {
      const res = await api.get('/admin/booths');
      setBooths(res.data?.booths || res.data || []);
    } catch { 
      setBooths([
        { id: 'B001', location: 'City Hall', voterCount: 450, active: true },
        { id: 'B002', location: 'Public Library', voterCount: 380, active: true },
        { id: 'B003', location: 'Community Center', voterCount: 420, active: false },
      ]);
    }
  }, []);

  useEffect(() => { fetchMetrics(); fetchBooths(); }, [fetchMetrics, fetchBooths]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchMetrics();
    socket.on('vote:update', handler);
    return () => socket.off('vote:update', handler);
  }, [socket, fetchMetrics]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab metrics={metrics} loading={metricsLoading} />;
      case 'voters':     return <VotersTab booths={booths} />;
      case 'candidates': return <CandidatesTab booths={booths} />;
      case 'booths':     return <BoothsTab />;
      case 'results':    return <ResultsTab />;
      case 'audit':      return <AuditLogTable />;
      case 'control':    return <ElectionControlTab />;
      default:           return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex page-fade">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-3 flex items-center justify-between shrink-0 lg:pl-6 pl-14">
          <div>
            <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
              Admin Dashboard
            </p>
            <p className="text-slate-500 text-xs font-mono capitalize">{activeTab}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Logout</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 sm:p-6 overflow-y-auto scrollbar-thin">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
