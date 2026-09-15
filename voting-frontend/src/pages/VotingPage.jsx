import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Vote, ShieldCheck, UserCheck, MapPin, Building, Award, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CandidateCard from '../components/voting/CandidateCard';
import ConfirmVoteModal from '../components/voting/ConfirmVoteModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function VotingPage() {
  const [candidates, setCandidates] = useState([]);
  const [voterProfile, setVoterProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { voterId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch voter profile & booth info
    api.get('/auth/me')
      .then(res => {
        if (res.data?.voter) {
          setVoterProfile(res.data.voter);
        }
      })
      .catch(err => console.log('Profile fetch error:', err));

    // Fetch candidates for assigned booth
    api.get('/candidates')
      .then(r => {
        const data = r.data?.candidates || [];
        setCandidates(data);
      })
      .catch(() => {
        toast.error('Failed to load candidates');
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCandidate = candidates.find(c => c.id === selectedId || c.candidateId === selectedId);

  const handleCastVote = () => {
    if (!selectedId) return;
    setShowModal(true);
  };

  const handleConfirmVote = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/vote', { candidateId: selectedId });
      navigate('/confirmation', { state: { txHash: res.data.txHash || res.data.transactionHash || 'N/A', voterProfile } });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || '';
      if (status === 403 && msg.toLowerCase().includes('already')) {
        navigate('/confirmation', { state: { txHash: 'ALREADY_VOTED', voterProfile } });
      } else if (status === 403 && msg.toLowerCase().includes('booth')) {
        toast.error('You are not assigned to this booth');
        setShowModal(false);
      } else {
        toast.error(msg || 'Failed to cast vote. Please try again.');
        setShowModal(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 page-fade pb-16">
      {/* Header bar */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wide text-base block" style={{ fontFamily: 'Syne, sans-serif' }}>
                KARNATAKA STATE ELECTION COMMISSION
              </span>
              <span className="text-slate-400 text-xs font-mono">Elections 2026 · E-Voting Portal</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              2FA Verified
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Karnataka Voter Profile Summary Card */}
        <div className="bg-gradient-to-r from-slate-800/90 via-slate-800/60 to-slate-800/90 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Voter Identity */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <UserCheck className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {voterProfile?.fullName || 'Registered Voter'}
                  </h2>
                  <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-0.5 rounded-md font-mono border border-blue-500/20">
                    VOTER
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-mono flex items-center gap-3">
                  <span>EPIC No: <strong className="text-slate-200">{voterProfile?.epicNumber || `KA/01/172/${voterId}`}</strong></span>
                  <span>·</span>
                  <span>Aadhaar Linked: <strong className="text-slate-200">XXXX-XXXX-{voterProfile?.aadhaarLast4 || '4829'}</strong></span>
                </p>
              </div>
            </div>

            {/* Right Regional & Polling Station Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-700/50">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Constituency</span>
                </div>
                <p className="text-white text-xs font-semibold truncate">
                  {voterProfile?.booth?.constituency || 'BTM Layout (AC-172)'}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Polling Station</span>
                </div>
                <p className="text-white text-xs font-semibold truncate" title={voterProfile?.booth?.location}>
                  {voterProfile?.booth?.location || 'St. John Auditorium'}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>District / Ward</span>
                </div>
                <p className="text-white text-xs font-semibold truncate">
                  {voterProfile?.booth?.district || 'Bengaluru Urban'} · {voterProfile?.booth?.wardNumber || 'Ward 172'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              Official Ballot Paper
            </h1>
            <p className="text-slate-400 text-sm">
              Select one candidate below. Your vote will be cryptographically signed and stored on the Ethereum blockchain ledger.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/40">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Booth Restricted</span>
          </div>
        </div>

        {/* Candidates grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner size={36} className="text-blue-400" />
            <p className="text-slate-400 text-sm">Fetching candidates for {voterProfile?.booth?.constituency || 'your constituency'}…</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-24 bg-slate-800/40 rounded-2xl border border-slate-700/40">
            <p className="text-slate-400 font-medium">No candidates available for your assigned booth.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {candidates.map(c => (
              <CandidateCard
                key={c.id || c.candidateId}
                candidate={c}
                selected={(c.id || c.candidateId) === selectedId}
                onClick={() => setSelectedId(c.id || c.candidateId)}
              />
            ))}
          </div>
        )}

        {/* Cast Vote button */}
        <div className="flex flex-col items-center justify-center pt-4">
          <button
            onClick={handleCastVote}
            disabled={!selectedId || loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
              text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-500/30
              text-base transform active:scale-95"
          >
            <Vote className="w-5 h-5" />
            Submit Ballot to Blockchain
          </button>

          {selectedCandidate && (
            <p className="text-slate-400 text-sm mt-4 font-mono bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700/50">
              Selection: <strong className="text-white">{selectedCandidate.name}</strong> ({selectedCandidate.party})
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <ConfirmVoteModal
          candidate={selectedCandidate}
          onCancel={() => !submitting && setShowModal(false)}
          onConfirm={handleConfirmVote}
          loading={submitting}
        />
      )}
    </div>
  );
}
