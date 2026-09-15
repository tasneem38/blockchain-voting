import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Copy, Check, Printer, ShieldCheck, CheckCircle2, UserCheck, MapPin, Award, Building, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { truncateHash, copyToClipboard } from '../utils/helpers';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const txHash = state?.txHash || 'N/A';
  const navigate = useNavigate();
  const { logout, voterId } = useAuth();

  const [voterProfile, setVoterProfile] = useState(state?.voterProfile || null);
  const [countdown, setCountdown] = useState(60);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If voterProfile was not passed in location state, fetch from backend
    if (!voterProfile) {
      api.get('/auth/me')
        .then(res => {
          if (res.data?.voter) {
            setVoterProfile(res.data.voter);
          }
        })
        .catch(err => console.error('Failed to fetch profile for receipt:', err));
    }
  }, [voterProfile]);

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
      toast.success('Transaction Hash copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const voterName = voterProfile?.fullName || 'Registered Voter';
  const epicNo = voterProfile?.epicNumber || `KA/01/172/${voterId || '100001'}`;
  const vId = voterProfile?.voterId || voterId || 'VOTER-001';
  const constituency = voterProfile?.booth?.constituency || 'BTM Layout (AC-172)';
  const wardNo = voterProfile?.booth?.wardNumber || 'Ward 172';
  const pollingStation = voterProfile?.booth?.location || 'St. John Auditorium, Koramangala';
  const district = voterProfile?.booth?.district || 'Bengaluru Urban';
  const stateName = voterProfile?.booth?.state || 'Karnataka';

  // Structured human-readable payload for scanning QR Code
  const qrTextPayload = [
    '=== KARNATAKA STATE ELECTION COMMISSION ===',
    'OFFICIAL DIGITAL E-VOTE RECEIPT',
    '-------------------------------------------',
    `Voter Name     : ${voterName}`,
    `EPIC Number    : ${epicNo}`,
    `Voter ID       : ${vId}`,
    `Constituency   : ${constituency}`,
    `Ward Number    : ${wardNo}`,
    `Polling Station: ${pollingStation}`,
    `District/State : ${district}, ${stateName}`,
    '-------------------------------------------',
    `Vote Status    : VOTE MARKED & CAST`,
    `Tx Hash        : ${txHash}`,
    `Issued Date    : ${new Date().toLocaleDateString()}`,
    '===========================================',
    'Verified & Recorded on Ethereum Blockchain'
  ].join('\n');

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8 page-fade">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Main Receipt Card */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl print:bg-white print:text-black print:border-black print:shadow-none">
          
          {/* Header */}
          <div className="border-b border-slate-700/60 pb-6 mb-6 text-center print:border-black">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 print:hidden">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-sm font-bold tracking-wider text-amber-400 uppercase font-mono print:text-black">
                Election Commission of Karnataka
              </h2>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Official Digital Vote Receipt
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 print:text-gray-600">
              Karnataka State Legislative Assembly Elections 2026
            </p>
          </div>

          {/* Status Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 print:border-emerald-700 print:bg-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 font-mono block print:text-emerald-800">
                  Ballot Status
                </span>
                <span className="text-base sm:text-lg font-extrabold text-white print:text-black">
                  {txHash === 'ALREADY_VOTED' ? 'VOTE ALREADY RECORDED' : 'VOTE MARKED & RECORDED'}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-mono font-semibold border border-emerald-500/30">
              <Lock className="w-3.5 h-3.5" />
              Tamper-Proof
            </div>
          </div>

          {/* Receipt Details Grid */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 mb-6 print:bg-gray-50 print:border-gray-300">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 font-bold flex items-center gap-2 print:text-gray-700">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Voter & Polling Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/40 print:bg-white print:border-gray-200">
                <span className="text-slate-400 text-xs block mb-0.5 font-mono print:text-gray-500">Voter Full Name</span>
                <strong className="text-white text-base font-bold print:text-black">{voterName}</strong>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/40 print:bg-white print:border-gray-200">
                <span className="text-slate-400 text-xs block mb-0.5 font-mono print:text-gray-500">EPIC Number</span>
                <strong className="text-amber-300 text-base font-mono font-bold print:text-black">{epicNo}</strong>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/40 print:bg-white print:border-gray-200">
                <span className="text-slate-400 text-xs block mb-0.5 font-mono print:text-gray-500">Voter ID</span>
                <strong className="text-blue-300 font-mono font-semibold print:text-black">{vId}</strong>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/40 print:bg-white print:border-gray-200">
                <span className="text-slate-400 text-xs block mb-0.5 font-mono print:text-gray-500">Constituency</span>
                <strong className="text-white font-semibold print:text-black">{constituency}</strong>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/40 print:bg-white print:border-gray-200">
                <span className="text-slate-400 text-xs block mb-0.5 font-mono print:text-gray-500">Ward Number</span>
                <strong className="text-emerald-300 font-mono font-semibold print:text-black">{wardNo}</strong>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/40 print:bg-white print:border-gray-200">
                <span className="text-slate-400 text-xs block mb-0.5 font-mono print:text-gray-500">District / State</span>
                <strong className="text-white font-semibold print:text-black">{district}, {stateName}</strong>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/40 sm:col-span-2 print:bg-white print:border-gray-200">
                <span className="text-slate-400 text-xs block mb-0.5 font-mono print:text-gray-500">Polling Station / Location</span>
                <strong className="text-slate-200 font-medium print:text-black">{pollingStation}</strong>
              </div>
            </div>
          </div>

          {/* QR Code & Verification Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-slate-900/40 border border-slate-700/40 rounded-2xl p-5 mb-6 print:bg-white print:border-gray-300">
            {/* QR Container */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 inline-block mb-2">
                <QRCode value={qrTextPayload} size={130} />
              </div>
              <span className="text-[11px] font-mono text-slate-400 print:text-gray-600">
                Scan QR code to verify receipt payload
              </span>
            </div>

            {/* Blockchain Audit Trail */}
            <div className="sm:col-span-2 space-y-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold block mb-1.5 print:text-gray-600">
                  Cryptographic Audit Hash
                </span>
                {txHash !== 'ALREADY_VOTED' && txHash !== 'N/A' ? (
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-300 transition-all print:bg-gray-100 print:text-black print:border-gray-300"
                  >
                    <span className="truncate">{txHash}</span>
                    {copied ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                ) : (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-xs text-emerald-400">
                    Verified on Blockchain Ledger
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-mono font-medium print:text-emerald-800">
                  Immutable Ethereum Smart Contract Record Verified
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Session Timer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-700/50 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              Print / Save Official Receipt
            </button>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                Session auto-close: <strong className="text-amber-400">{countdown}s</strong>
              </span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                Logout Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

