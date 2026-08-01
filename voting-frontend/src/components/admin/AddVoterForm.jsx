import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function AddVoterForm({ onClose, onSuccess, booths = [] }) {
  const [form, setForm] = useState({ voterId: '', email: '', password: '', boothId: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.voterId || !form.email || !form.password || !form.boothId) {
      toast.error('All fields are required'); return;
    }
    setLoading(true);
    try {
      await api.post('/admin/voters', form);
      toast.success('Voter added successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add voter');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm h-full max-h-[90vh] overflow-y-auto animate-slide-in-right shadow-2xl">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Add New Voter</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { label: 'Voter ID', key: 'voterId', type: 'text', placeholder: 'VTR001' },
            { label: 'Email',    key: 'email',   type: 'email', placeholder: 'voter@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Booth</label>
            <select
              value={form.boothId}
              onChange={e => set('boothId', e.target.value)}
              className={inputClass}
            >
              <option value="">Select booth…</option>
              {booths.map(b => (
                <option key={b.id} value={b.id}>{b.id} — {b.location}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              {loading ? <><LoadingSpinner size={15} /> Saving…</> : 'Add Voter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
