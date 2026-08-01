import {
  LayoutDashboard, Users, UserSquare, Building2,
  BarChart3, FileText, Settings, ShieldCheck, X, Menu
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',          icon: LayoutDashboard },
  { id: 'voters',     label: 'Voters',             icon: Users },
  { id: 'candidates', label: 'Candidates',         icon: UserSquare },
  { id: 'booths',     label: 'Booths',             icon: Building2 },
  { id: 'results',    label: 'Results',            icon: BarChart3 },
  { id: 'audit',      label: 'Audit Log',          icon: FileText },
  { id: 'control',   label: 'Election Control',    icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-700/50">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
        <div>
          <p className="font-extrabold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>BlockVote</p>
          <p className="text-slate-500 text-xs font-mono">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === id
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <p className="text-slate-600 text-xs font-mono">v1.0.0 · ADMIN</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-slate-800/50 border-r border-slate-700/50 h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 bg-slate-800 border border-slate-700 p-2 rounded-lg"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-56 bg-slate-800 border-r border-slate-700 z-40 animate-slide-in-right">
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
