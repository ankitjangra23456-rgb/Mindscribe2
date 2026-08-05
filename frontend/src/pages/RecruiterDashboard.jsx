import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Search, Star, StarOff, Download, Eye, Filter, Briefcase, TrendingUp, Users, Target } from 'lucide-react';
import { MOCK_CANDIDATES } from '../services/mockData';

export default function RecruiterDashboard() {
  const location = useLocation();
  const [search,     setSearch]     = useState('');
  const [skillFilter,setSkillFilter]= useState('All');
  const [shortlist,  setShortlist]  = useState(new Set());
  const [activeTab,  setActiveTab]  = useState('search');
  const [inspectCandidate, setInspectCandidate] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('shortlist')) setActiveTab('shortlist');
    else if (path.includes('reports') || path.includes('analytics')) setActiveTab('analytics');
    else setActiveTab('search');
  }, [location.pathname]);

  const ALL_SKILLS = ['All', 'Java', 'Python', 'Angular', '.NET', 'React', 'SQL', 'AI/ML'];

  const filtered = MOCK_CANDIDATES.filter(c => {
    const matchName  = c.name.toLowerCase().includes(search.toLowerCase());
    const matchSkill = skillFilter === 'All' || c.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    return matchName && matchSkill;
  });

  const toggleShortlist = (id) => {
    setShortlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const shortlisted = MOCK_CANDIDATES.filter(c => shortlist.has(c.id));

  const TABS = [
    { id: 'search',    label: 'Search Candidates', icon: Search },
    { id: 'shortlist', label: `My Shortlist (${shortlist.size})`, icon: Star },
    { id: 'analytics', label: 'Analytics',          icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Recruiter Portal</h1>
            <p className="text-slate-500 text-sm mt-1">TechCorp Solutions — Find top talent via AI-verified skill scores</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Recruiter
          </span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Candidates Available', value: MOCK_CANDIDATES.filter(c => c.available).length, icon: Users,    color: 'bg-blue-100 text-blue-600' },
            { label: 'Shortlisted',          value: shortlist.size,                                   icon: Star,     color: 'bg-amber-100 text-amber-600' },
            { label: 'Avg SCI Score',        value: '88%',                                            icon: Target,   color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Profiles Viewed',      value: '12',                                             icon: Eye,      color: 'bg-purple-100 text-purple-600' },
          ].map(s => (
            <div key={s.label} className="card p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Search Tab ── */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search by name or skill..."
                  value={search} onChange={e => setSearch(e.target.value)} className="input-base pl-9" />
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSkillFilter(skill)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      skillFilter === skill
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => (
                <CandidateCard key={c.id} candidate={c} isShortlisted={shortlist.has(c.id)} onToggleShortlist={() => toggleShortlist(c.id)} onInspect={() => setInspectCandidate(c)} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No candidates found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Shortlist Tab ── */}
        {activeTab === 'shortlist' && (
          <div className="space-y-4">
            {shortlisted.length === 0 ? (
              <div className="card p-16 shadow-card text-center text-slate-400">
                <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No candidates shortlisted yet</p>
                <p className="text-sm mt-1">Click the star icon on candidate cards to shortlist them</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-600">{shortlisted.length} candidate(s) shortlisted</p>
                  <button className="btn-primary text-xs px-4 py-2">
                    <Download className="w-3.5 h-3.5" /> Export Shortlist
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shortlisted.map(c => (
                    <CandidateCard key={c.id} candidate={c} isShortlisted={true} onToggleShortlist={() => toggleShortlist(c.id)} onInspect={() => setInspectCandidate(c)} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Profiles Viewed',       value: '47', delta: '+8 this week' },
                { label: 'Shortlist Conversion',  value: '31%', delta: 'Industry avg: 22%' },
                { label: 'Interview Scheduled',   value: '6',  delta: 'This month' },
              ].map(s => (
                <div key={s.label} className="card p-6 shadow-card text-center space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
                  <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.delta}</p>
                </div>
              ))}
            </div>

            <div className="card p-6 shadow-card space-y-4">
              <h2 className="text-base font-bold text-slate-900">Most Demanded Skills</h2>
              <div className="space-y-3">
                {[
                  { skill: 'Java',    pct: 78 },
                  { skill: 'Python',  pct: 65 },
                  { skill: 'React',   pct: 58 },
                  { skill: '.NET',    pct: 45 },
                  { skill: 'SQL',     pct: 90 },
                  { skill: 'AI/ML',   pct: 72 },
                ].map(s => (
                  <div key={s.skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{s.skill}</span><span>{s.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Candidate Deep-Dive Modal ── */}
        {inspectCandidate && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-lg w-full space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {inspectCandidate.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{inspectCandidate.name}</h3>
                    <p className="text-xs text-slate-500">{inspectCandidate.degree} · {inspectCandidate.university}</p>
                  </div>
                </div>
                <button onClick={() => setInspectCandidate(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {/* SCI Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-bold text-blue-700">Execution Proof (EP)</p>
                  <p className="text-2xl font-black text-blue-900">{Math.round(inspectCandidate.ep * 100)}%</p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs font-bold text-purple-700">Verification Proof (VP)</p>
                  <p className="text-2xl font-black text-purple-900">{Math.round(inspectCandidate.vp * 100)}%</p>
                </div>
              </div>

              {/* Verified Skills */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Verified Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {inspectCandidate.skills.map(s => (
                    <span key={s} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setInspectCandidate(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Close
                </button>
                <button className="flex-1 btn-primary py-2 text-xs">
                  Schedule AI Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function CandidateCard({ candidate: c, isShortlisted, onToggleShortlist, onInspect }) {
  const initials = c.name.split(' ').map(w => w[0]).join('');
  const sciColor = c.sci_score >= 90 ? 'text-emerald-600' : c.sci_score >= 80 ? 'text-blue-600' : 'text-amber-600';
  const sciBg    = c.sci_score >= 90 ? 'bg-emerald-50 border-emerald-100' : c.sci_score >= 80 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100';

  return (
    <div className="card p-5 shadow-card hover:shadow-lg transition-shadow space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{c.name}</p>
            <p className="text-xs text-slate-400">{c.degree} · {c.university}</p>
          </div>
        </div>
        <button onClick={onToggleShortlist} className={`p-2 rounded-lg transition-all ${isShortlisted ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'}`}>
          {isShortlisted ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
        </button>
      </div>

      {/* SCI score */}
      <div className={`flex items-center justify-between p-3 rounded-xl border ${sciBg}`}>
        <div>
          <p className="text-xs font-bold text-slate-500">Skill Confidence Index</p>
          <p className={`text-xl font-extrabold ${sciColor}`}>{c.sci_score}%</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>EP: <span className="font-bold">{Math.round(c.ep * 100)}%</span></p>
          <p>VP: <span className="font-bold">{Math.round(c.vp * 100)}%</span></p>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {c.skills.map(s => (
          <span key={s} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">{s}</span>
        ))}
      </div>

      {/* Available badge + actions */}
      <div className="flex items-center justify-between pt-1">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {c.available ? '● Available' : '○ Unavailable'}
        </span>
        <div className="flex gap-1.5">
          <button onClick={onInspect} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

