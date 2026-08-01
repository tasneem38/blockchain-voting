import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Vote, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CandidateCard from '../components/voting/CandidateCard';
import ConfirmVoteModal from '../components/voting/ConfirmVoteModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function VotingPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { voterId, boothId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/candidates')
      .then(r => {
        const data = r.data?.candidates || [];
        if (data.length === 0) {
          setCandidates([
            { id: '1', name: 'John Miller', party: 'Independent' },
            { id: '2', name: 'Sarah Wilson', party: 'Liberty Party' },
            { id: '3', name: 'David Chen', party: 'Future Alliance' },
            { id: '4', name: 'Maria Garcia', party: 'Unity Group' },
          ]);
        } else {
          setCandidates(data);
        }
      })
      .catch(() => {
        // Fallback to mock data for demonstration
        setCandidates([
          { id: '1', name: 'John Miller', party: 'Independent' },
          { id: '2', name: 'Sarah Wilson', party: 'Liberty Party' },
          { id: '3', name: 'David Chen', party: 'Future Alliance' },
          { id: '4', name: 'Maria Garcia', party: 'Unity Group' },
        ]);
        toast.error('Using mock data (Backend not found)');
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
      navigate('/confirmation', { state: { txHash: res.data.txHash || res.data.transactionHash || 'N/A' } });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || '';
      if (status === 403 && msg.toLowerCase().includes('already')) {
        navigate('/confirmation', { state: { txHash: 'ALREADY_VOTED' } });
      } else if (status === 403 && msg.toLowerCase().includes('booth')) {
        toast.error('You are not assigned to this booth');
        setShowModal(false);
      } else {
        toast.error('Failed to cast vote. Please try again.');
        setShowModal(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 page-fade">
      {/* Header bar */}
      <div className="bg-slate-800/60 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>BlockVote</span>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-semibold font-mono">{voterId}</p>
            {boothId && <p className="text-slate-500 text-xs font-mono">Booth {boothId}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            Cast Your Vote
          </h1>
          <p className="text-slate-400 text-sm">Select a candidate below. Your vote is encrypted and recorded immutably.</p>
        </div>

        {/* Candidates grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner size={36} className="text-blue-400" />
            <p className="text-slate-400 text-sm">Loading candidates…</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400">No candidates available for your booth.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="flex justify-center">
          <button
            onClick={handleCastVote}
            disabled={!selectedId || loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
              text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30
              text-base"
          >
            <Vote className="w-5 h-5" />
            Cast Vote
          </button>
        </div>

        {selectedCandidate && (
          <p className="text-center text-slate-500 text-sm mt-4 font-mono">
            Selected: {selectedCandidate.name} · {selectedCandidate.party}
          </p>
        )}
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
