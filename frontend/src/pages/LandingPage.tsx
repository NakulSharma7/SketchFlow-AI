import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col justify-between font-sans selection:bg-slate-900 selection:text-white relative overflow-hidden">
      {/* Subtle Architectural Dot Canvas Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.22]"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 60%, transparent 100%)',
        }}
      />

      {/* Navigation Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-6xl w-full mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 font-['Outfit']">
              SketchFlow <span className="font-normal text-slate-400">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-medium rounded-lg text-sm transition active:scale-[0.98]"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-medium rounded-lg text-sm shadow-xs transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl w-full mx-auto px-6 pt-16 pb-20 text-center space-y-10 relative z-10 my-auto">
        {/* Refined Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-xs font-medium text-slate-700 transition hover:border-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span>Powered by Gemini AI & Express + Prisma</span>
        </div>

        {/* Display Typography */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.035em] text-slate-900 leading-[1.1] font-['Outfit']">
            From Idea to Architecture <br />
            <span className="text-slate-500 font-medium block mt-1">
              in Seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-normal pt-2 font-sans">
            The intelligent whiteboard for software engineers and creators. Draw manual flowcharts or prompt AI to build complex backend, auth, and database architecture diagrams in seconds.
          </p>
        </div>

        {/* Proper Hero CTA Area */}
        <div className="space-y-4 pt-1 max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to={token ? '/dashboard' : '/signup'}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-medium rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer font-sans group"
            >
              <span>{token ? 'Open Whiteboard Workspace' : 'Start Creating Free'}</span>
              <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to={token ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-800 font-medium rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base flex items-center justify-center cursor-pointer font-sans"
            >
              {token ? 'View Saved Boards' : 'Log In'}
            </Link>
          </div>

          {/* Reassuring Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span> Free whiteboard workspace
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span> Instant diagram generation
            </span>
          </div>
        </div>

        {/* Minimalist Whiteboard Visual Teaser */}
        <div className="pt-4 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md shadow-[0_16px_36px_-12px_rgba(0,0,0,0.06)] p-5 text-left relative overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                <span className="text-xs text-slate-400 font-mono ml-2">architecture-canvas</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ready to sketch
              </div>
            </div>

            {/* Architecture Node Illustration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Input</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">User Prompt</div>
                <div className="text-[11px] text-slate-500 mt-1">"Build auth flowchart"</div>
              </div>

              <div className="flex items-center justify-center text-slate-400 font-mono text-xs">
                <span>──────✦──────&gt;</span>
              </div>

              <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] font-mono text-blue-400 uppercase">AI Output</div>
                <div className="text-xs font-bold text-white mt-0.5">Live Vector Diagram</div>
                <div className="text-[11px] text-slate-300 mt-1">Rendered on Canvas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 text-left">
          {/* Card 1 */}
          <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2 hover:border-slate-300 transition-all">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold mb-3">
              🔒
            </div>
            <h3 className="font-semibold text-slate-900 text-base font-['Outfit']">Auth & User Security</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              JWT verification with bcrypt password hashing and user isolation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2 hover:border-slate-300 transition-all">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold mb-3">
              💾
            </div>
            <h3 className="font-semibold text-slate-900 text-base font-['Outfit']">Prisma & PostgreSQL</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Instant board saving and retrieval with clean JSON canvas schemas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2 hover:border-slate-300 transition-all">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold mb-3">
              🧠
            </div>
            <h3 className="font-semibold text-slate-900 text-base font-['Outfit']">AI Diagram Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Structured Gemini API generation for flowcharts, diagrams, and sequence charts.
            </p>
          </div>
        </div>

        {/* High-Impact Dedicated Bottom CTA Section */}
        <div className="pt-14 max-w-5xl mx-auto w-full">
          <div className="rounded-3xl bg-slate-900 text-white p-10 sm:p-14 border border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden text-center space-y-6">
            {/* Subtle dot matrix pattern inside CTA card */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            
            <div className="relative z-10 space-y-3.5 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Start Creating Today</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-['Outfit'] leading-tight">
                From Idea to Architecture <br />
                <span className="text-slate-400 font-medium block mt-1">
                  in Seconds.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                The intelligent whiteboard for software engineers and creators. Draw manual flowcharts or prompt AI to build complex backend diagrams in seconds.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to={token ? '/dashboard' : '/signup'}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{token ? 'Open Whiteboard Workspace' : 'Start Creating Free'}</span>
                <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to={token ? '/dashboard' : '/login'}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base flex items-center justify-center cursor-pointer"
              >
                {token ? 'View Saved Boards' : 'Log In'}
              </Link>
            </div>

            <p className="relative z-10 text-xs text-slate-500 font-medium pt-1">
              Free forever for individuals • Instant board saving with Prisma & PostgreSQL
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white">
        © 2026 SketchFlow AI. Express • Prisma • PostgreSQL • React.
      </footer>
    </div>
  );
}
