import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function LoginForm() {
  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { setPendingVoterId } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!voterId.trim()) errs.voterId = 'Voter ID is required';
    else if (voterId.trim().length < 5) errs.voterId = 'Voter ID must be at least 5 characters';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      // MOCK LOGIN FOR TESTING (since no backend is present yet)
      if (voterId.trim() === 'VOTER123' && password === 'password123') {
        setPendingVoterId(voterId.trim());
        navigate('/verify-otp');
        return;
      }
      if (voterId.trim() === 'ADMIN' && password === 'admin123') {
        setPendingVoterId(voterId.trim());
        navigate('/verify-otp');
        return;
      }

      await api.post('/auth/login', { voterId: voterId.trim(), password });
      setPendingVoterId(voterId.trim());
      navigate('/verify-otp');
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      if (status === 401) toast.error(serverMsg || 'Invalid credentials');
      else if (status === 423) toast.error(serverMsg || 'Account locked. Try after 30 minutes');
      else if (status === 429) toast.error(serverMsg || 'Too many login attempts. Please wait a moment.');
      else toast.error(serverMsg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 page-fade">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.04) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            BlockVote
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">Blockchain-secured voting system</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Sign in to vote</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Voter ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Voter ID
              </label>
              <input
                type="text"
                value={voterId}
                onChange={e => setVoterId(e.target.value)}
                placeholder="Enter your Voter ID"
                className={`w-full bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono
                  ${errors.voterId ? 'border-red-500/60' : 'border-slate-600/50 hover:border-slate-500'}`}
                autoComplete="username"
              />
              {errors.voterId && (
                <p className="text-red-400 text-xs mt-1">{errors.voterId}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full bg-slate-900 border rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                    ${errors.password ? 'border-red-500/60' : 'border-slate-600/50 hover:border-slate-500'}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 mt-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size={18} />
                  <span>Authenticating…</span>
                </>
              ) : 'Login'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          SECURED BY BLOCKCHAIN TECHNOLOGY
        </p>
      </div>
    </div>
  );
}
