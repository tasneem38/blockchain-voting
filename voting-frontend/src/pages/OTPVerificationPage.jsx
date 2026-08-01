import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OTPInput from '../components/otp/OTPInput';
import CountdownTimer from '../components/otp/CountdownTimer';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const { voterId, login } = useAuth();
  const navigate = useNavigate();

  if (!voterId) {
    navigate('/login');
    return null;
  }

  const handleVerify = async () => {
    if (otp.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      // MOCK OTP FOR TESTING
      if (otp === '123456' && process.env.NODE_ENV === 'development') {
        const isAppAdmin = voterId.startsWith('ADMIN');
        login('mock-token-' + Date.now(), { 
          voterId, 
          role: isAppAdmin ? 'ADMIN' : 'VOTER',
          name: isAppAdmin ? 'Administrator' : 'Test Voter'
        });
        navigate(isAppAdmin ? '/admin' : '/vote');
        return;
      }

      const res = await api.post('/auth/verify-otp', { voterId, otp });
      const { token, ...userData } = res.data;
      
      // Merge admin or voter payload so context has role
      const authPayload = userData.admin ? { ...userData.admin, voterId } : { ...userData.voter, voterId };
      login(token, authPayload);
      
      navigate(userData.admin ? '/admin' : '/vote');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) toast.error('Invalid OTP');
      else if (status === 410) {
        toast.error('OTP expired. Please login again');
        navigate('/login');
      } else toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!timerExpired) return;
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { voterId });
      toast.success('OTP resent successfully');
      setOtp('');
      setTimerExpired(false);
      setTimerKey(k => k + 1);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 page-fade">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/4 rounded-full blur-3xl" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.04) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Two-Factor Auth
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter the 6-digit OTP sent to your registered contact
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Authenticating as</p>
              <p className="text-white font-semibold font-mono">{voterId}</p>
            </div>
            <CountdownTimer key={timerKey} initialSeconds={300} onExpire={() => setTimerExpired(true)} />
          </div>

          <OTPInput value={otp} onChange={setOtp} />

          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2
              shadow-lg shadow-blue-600/20"
          >
            {loading ? <><LoadingSpinner size={18} /> Verifying…</> : 'Verify OTP'}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={!timerExpired || resending}
              className="text-sm font-semibold transition-colors disabled:text-slate-600 disabled:cursor-not-allowed
                enabled:text-blue-400 enabled:hover:text-blue-300"
            >
              {resending ? 'Resending…' : timerExpired ? 'Resend OTP' : 'Resend OTP (wait for timer)'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
