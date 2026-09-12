import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { truncateHash, copyToClipboard } from '../utils/helpers';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const txHash = state?.txHash || 'N/A';
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      logout();
      navigate('/login');
      return;
    }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, logout, navigate]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(txHash);
    if (ok) {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const explorerUrl = txHash !== 'N/A' && txHash !== 'ALREADY_VOTED'
    ? `https://etherscan.io/tx/${txHash}`
    : '#';

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 page-fade">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center">
          {/* Animated checkmark */}
          <div className="mb-6 flex justify-center">
            <div className="animate-check-circle w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center bg-green-500/10">
              <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="animate-checkmark-draw"
                  d="M10 21 L17 28 L30 13"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            {txHash === 'ALREADY_VOTED' ? 'Already Voted' : 'Vote Recorded!'}
          </h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {txHash === 'ALREADY_VOTED'
              ? 'Your vote has already been recorded on the blockchain.'
              : 'Your vote has been successfully recorded on the blockchain. It is immutable and tamper-proof.'
            }
          </p>

          {/* QR Code */}
          {txHash !== 'N/A' && txHash !== 'ALREADY_VOTED' && (
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <QRCode value={txHash} size={148} />
            </div>
          )}

          {/* Transaction hash */}
          {txHash !== 'ALREADY_VOTED' && txHash !== 'N/A' && (
            <div className="mb-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-mono mb-2">Transaction Hash</p>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 mx-auto bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 font-mono text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              >
                <span>{truncateHash(txHash)}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Explorer link */}
          {txHash !== 'N/A' && txHash !== 'ALREADY_VOTED' && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified on Local Ganache Blockchain
              </span>
            </div>
          )}

          {/* Countdown */}
          <div className="border-t border-slate-700/50 pt-4 mt-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <p className="text-slate-400 text-sm font-mono">
                Session ending in <span className="text-amber-400 font-bold">{countdown}s</span>
              </p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="mt-3 text-slate-500 hover:text-white text-sm transition-colors underline underline-offset-2"
            >
              Logout now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
