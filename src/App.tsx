import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Search, 
  Zap, 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  ChevronRight, 
  Github, 
  Clipboard, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Clock,
  DollarSign,
  CheckCircle2,
  Cpu,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { analyzeWorkflow } from './services/gemini';

// Mock Data
const COST_DISTRIBUTION = [
  { name: 'Tests', value: 45, color: '#1A1A1A' },
  { name: 'Build', value: 25, color: '#666666' },
  { name: 'Deploy', value: 15, color: '#A68B6A' },
  { name: 'Lint/Static', value: 10, color: '#D44D2B' },
  { name: 'Cleanup', value: 5, color: '#E5E1DB' },
];

const WASTE_TIMELINE = [
  { day: 'Mon', waste: 240 },
  { day: 'Tue', waste: 130 },
  { day: 'Wed', waste: 450 },
  { day: 'Thu', waste: 280 },
  { day: 'Fri', waste: 390 },
  { day: 'Sat', waste: 80 },
  { day: 'Sun', waste: 45 },
];

export default function App() {
  const [view, setView] = useState<'landing' | 'scanner' | 'calculator' | 'monitoring'>('landing');
  const [scannerStep, setScannerStep] = useState<'input' | 'dashboard'>('input');
  const [yaml, setYaml] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleStartAudit = () => {
    setView('scanner');
    setScannerStep('input');
  };

  const runAnalysis = async () => {
    if (!yaml.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeWorkflow(yaml);
      setAnalysisResult(result);
      setScannerStep('dashboard');
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please check your YAML or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-editorial-bg)] text-[var(--color-editorial-dark)] font-sans selection:bg-[var(--color-editorial-accent)]/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-[var(--color-editorial-border)] bg-[var(--color-editorial-bg)]/80 backdrop-blur-xl flex items-center justify-between px-12">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
          <div className="size-8 bg-[var(--color-editorial-dark)] flex items-center justify-center text-white font-bold text-xs ring-4 ring-white shadow-sm">R</div>
          <span className="font-serif italic text-2xl tracking-tight">RunBurn</span>
        </div>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--color-editorial-text-muted)]">
            <button 
              onClick={() => { setView('scanner'); setScannerStep('input'); }} 
              className={cn("hover:text-[var(--color-editorial-dark)] transition-colors", view === 'scanner' && "text-[var(--color-editorial-dark)]")}
            >
              Cost Scanner
            </button>
            <button 
              onClick={() => setView('calculator')} 
              className={cn("hover:text-[var(--color-editorial-dark)] transition-colors", view === 'calculator' && "text-[var(--color-editorial-dark)]")}
            >
              Flakiness Calc
            </button>
            <button 
              onClick={() => setView('monitoring')} 
              className={cn("hover:text-[var(--color-editorial-dark)] transition-colors", view === 'monitoring' && "text-[var(--color-editorial-dark)]")}
            >
              Monitoring
            </button>
          </nav>
          <button 
            onClick={() => setView('scanner')}
            className="editorial-button-secondary"
          >
            Connect Repo
          </button>
        </div>
      </nav>

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {view === 'landing' && <LandingView onStart={handleStartAudit} />}
          {view === 'scanner' && scannerStep === 'input' && (
            <AuditInputView 
              yaml={yaml} 
              setYaml={setYaml} 
              onAnalyze={runAnalysis} 
              isAnalyzing={isAnalyzing} 
            />
          )}
          {view === 'scanner' && scannerStep === 'dashboard' && <DashboardView result={analysisResult} />}
          {view === 'calculator' && <FlakinessCalculatorView />}
          {view === 'monitoring' && <MonitoringView />}
        </AnimatePresence>
      </main>

      <footer className="h-14 bg-[var(--color-editorial-dark)] flex items-center px-12 gap-8 overflow-hidden sticky bottom-0 z-40">
        <div className="text-white text-[9px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">Industry Benchmarks:</div>
        <div className="flex-1 flex gap-12 items-center text-[10px] text-[#888] font-mono whitespace-nowrap overflow-hidden">
          <span className="text-white">SaaS AVG: $1,200/eng/yr</span>
          <span>FLAKINESS RATE: 8.4%</span>
          <span className="text-white italic underline">Your Rate: 12.2% (CRITICAL)</span>
          <span>RUNNER WASTE: 19%</span>
          <span className="text-white">IDLE QUEUE: 4min avg</span>
        </div>
        <div className="hidden sm:block text-[var(--color-editorial-accent)] text-[9px] font-bold uppercase tracking-[0.1em]">Live Waste Data Feed ●</div>
      </footer>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col lg:flex-row min-h-[calc(100vh-80px-56px)]"
    >
      {/* Left: Content Column */}
      <div className="w-full lg:w-[480px] border-r border-[var(--color-editorial-border)] p-12 lg:p-20 flex flex-col justify-center gap-10 bg-[var(--color-editorial-bg-alt)]">
        <div className="space-y-6">
          <span className="editorial-label">Diagnostic Tool 01</span>
          <h1 className="font-serif text-5xl lg:text-6xl leading-[1.1] italic text-[var(--color-editorial-dark)]">
            Your CI bill is leaking <span className="underline decoration-[var(--color-editorial-accent)] underline-offset-8">thousands</span> every year.
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-editorial-text-muted)] max-w-sm">
            Most engineering teams spend 30% more on GitHub Actions than necessary. Our scanner identifies wasted minutes, flaky reruns, and oversized runners in under 5 minutes.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <button 
            onClick={onStart}
            className="editorial-button-primary w-full shadow-2xl shadow-editorial-accent/20"
          >
            Start Free Audit
          </button>
          <p className="text-[10px] text-center text-[var(--color-editorial-text-muted)] italic">No credit card or write-access required.</p>
        </div>

        <div className="mt-4 pt-10 border-t border-[var(--color-editorial-border)] flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="size-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--color-editorial-text-muted)] leading-snug">
            Joined by <span className="font-bold text-[var(--color-editorial-dark)]">420+</span> DevOps Leads<br/>at high-growth engineering orgs.
          </p>
        </div>
      </div>

      {/* Right: Visual Preview */}
      <div className="flex-1 p-12 lg:p-24 flex flex-col justify-center bg-[var(--color-editorial-bg)] relative overflow-hidden">
        <div className="absolute top-10 right-10 flex gap-4 opacity-10 grayscale">
           <Github size={120} />
        </div>

        <div className="relative max-w-2xl w-full mx-auto">
          <div className="absolute -top-8 left-0 text-[10px] font-mono uppercase text-[var(--color-editorial-muted)]">Preview: Analysis_Report_v2.csv</div>
          
          <div className="border border-[var(--color-editorial-dark)] p-1 shadow-[30px_30px_0px_var(--color-editorial-border)]">
            <div className="bg-white border border-[var(--color-editorial-dark)] p-10">
               <div className="flex justify-between items-start mb-16">
                 <div>
                   <p className="editorial-label mb-2">Efficiency Score</p>
                   <div className="text-7xl font-serif italic">64<span className="text-3xl text-[var(--color-editorial-accent)]">/100</span></div>
                 </div>
                 <div className="text-right">
                   <p className="editorial-label mb-2">Est. Waste</p>
                   <div className="text-5xl font-serif text-[var(--color-editorial-accent)]">-$3,540<span className="text-base italic text-[var(--color-editorial-text-muted)]"> /mo</span></div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-12 mb-10">
                 <div className="space-y-6">
                   <h3 className="editorial-label border-b border-[var(--color-editorial-border)] pb-3">Waste Drivers</h3>
                   <div className="space-y-4">
                     {[
                       { label: 'Flaky Reruns', w: '70%', c: 'var(--color-editorial-dark)' },
                       { label: 'Matrix Bloat', w: '45%', c: 'var(--color-editorial-dark)' },
                       { label: 'Cache Misses', w: '90%', c: 'var(--color-editorial-accent)' },
                     ].map(item => (
                       <div key={item.label} className="flex items-center justify-between">
                         <span className="text-[11px] font-mono">{item.label}</span>
                         <div className="w-32 h-2 bg-[#F0F0F0]"><div className="h-full" style={{ width: item.w, backgroundColor: item.c }}></div></div>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="space-y-6">
                   <h3 className="editorial-label border-b border-[var(--color-editorial-border)] pb-3">Recommendation</h3>
                   <div className="p-4 bg-[var(--color-editorial-bg-alt)] border-l-2 border-[var(--color-editorial-accent)] text-[10px] font-mono leading-relaxed h-32">
                     <span className="text-[var(--color-editorial-muted)]"># cache-tuning</span><br/>
                     - name: Cache Modules<br/>
                     &nbsp;&nbsp;uses: actions/cache@v4<br/>
                     &nbsp;&nbsp;with:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;key: cache-{'{'}{'{'} hash {'}'}{'}'}<br/>
                     <span className="text-[var(--color-editorial-accent)] mt-1 block">+ Est. Savings: $840/mo</span>
                   </div>
                 </div>
               </div>

               <div className="flex justify-between items-center pt-8 border-t border-[var(--color-editorial-border)] text-[9px] uppercase tracking-tighter text-[var(--color-editorial-text-muted)]">
                 <div>AUDIT: 2026-05-14 14:22 GMT</div>
                 <div className="font-bold text-[var(--color-editorial-dark)]">CONFIDENTIAL INTEL REPORT</div>
               </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights beneath visual */}
        <div className="mt-24 grid grid-cols-3 gap-12 max-w-3xl mx-auto">
          <LandingFeature label="FLAKY TESTS" val="Critical" color="text-[var(--color-editorial-accent)]" />
          <LandingFeature label="RUNNER SIZE" val="Optimized" color="text-green-600" />
          <LandingFeature label="TOTAL BURN" val="$4.2k/mo" />
        </div>
      </div>
    </motion.div>
  );
}

function LandingFeature({ label, val, color }: { label: string, val: string, color?: string }) {
  return (
    <div className="space-y-1">
      <div className="editorial-label opacity-60">{label}</div>
      <div className={cn("text-lg font-serif italic", color || "text-[var(--color-editorial-dark)]")}>{val}</div>
    </div>
  );
}

function AuditInputView({ yaml, setYaml, onAnalyze, isAnalyzing }: { yaml: string, setYaml: (y: string) => void, onAnalyze: () => void, isAnalyzing: boolean }) {
  const [mode, setMode] = useState<'paste' | 'connect'>('paste');
  const [repo, setRepo] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-6 py-20"
    >
      <div className="text-center mb-16 space-y-4">
        <span className="editorial-label">Scanner Module 01</span>
        <h2 className="text-4xl font-serif italic text-[var(--color-editorial-dark)]">Input CI Definition</h2>
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={() => setMode('paste')}
            className={cn(
              "text-[10px] uppercase tracking-widest font-bold pb-1 border-b-2 transition-all",
              mode === 'paste' ? "border-[var(--color-editorial-accent)] text-[var(--color-editorial-dark)]" : "border-transparent text-gray-400"
            )}
          >
            Paste YAML
          </button>
          <button 
            onClick={() => setMode('connect')}
            className={cn(
              "text-[10px] uppercase tracking-widest font-bold pb-1 border-b-2 transition-all",
              mode === 'connect' ? "border-[var(--color-editorial-accent)] text-[var(--color-editorial-dark)]" : "border-transparent text-gray-400"
            )}
          >
            Connect Repository
          </button>
        </div>
      </div>

      <div className="relative group p-1 border border-[var(--color-editorial-dark)] shadow-[20px_20px_0px_var(--color-editorial-border)]">
        <div className="relative bg-white border border-[var(--color-editorial-dark)] overflow-hidden">
          <div className="h-10 bg-[var(--color-editorial-bg-alt)] border-b border-[var(--color-editorial-border)] flex items-center justify-between px-4">
            <span className="text-[10px] text-[var(--color-editorial-muted)] font-mono uppercase tracking-[0.2em] font-bold">
              {mode === 'paste' ? 'Input:_main.yml' : 'Repo:_Connection'}
            </span>
            <Github size={14} className="text-[var(--color-editorial-border)]" />
          </div>
          
          {mode === 'paste' ? (
            <textarea 
              value={yaml}
              onChange={(e) => setYaml(e.target.value)}
              placeholder="paste your yaml here..."
              className="w-full h-80 p-8 bg-transparent text-[var(--color-editorial-dark)] font-mono text-xs focus:outline-none resize-none placeholder:text-gray-300 leading-loose"
            />
          ) : (
            <div className="h-80 flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="size-16 bg-[var(--color-editorial-bg-alt)] border border-[var(--color-editorial-border)] flex items-center justify-center">
                <Github size={32} className="text-[var(--color-editorial-dark)]" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-serif italic text-[var(--color-editorial-dark)]">Link your GitHub repository for automated analysis.</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Read-only permissions requested.</p>
              </div>
              <input 
                type="text" 
                placeholder="org/repository-name"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full max-w-sm border-b border-[var(--color-editorial-dark)] p-2 text-center text-sm font-mono focus:outline-none placeholder:text-gray-200"
              />
              <button 
                onClick={() => {
                  setYaml(`name: Mock Repo Scan\n# Autodetected from ${repo}\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4`);
                  setMode('paste');
                }}
                disabled={!repo.includes('/')}
                className="editorial-button-secondary text-[10px]"
              >
                Fetch Workflows
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-6">
        <button 
          onClick={onAnalyze}
          disabled={isAnalyzing || !yaml.trim()}
          className={cn(
            "editorial-button-primary w-fit min-w-[300px]",
            (isAnalyzing || !yaml.trim()) ? "opacity-50 cursor-not-allowed bg-gray-400" : ""
          )}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-4">
              <RefreshCw className="animate-spin size-4" />
              <span>Analyzing Workflow...</span>
            </div>
          ) : (
            <span>Run Cost Scan</span>
          )}
        </button>
        <p className="text-[10px] text-[var(--color-editorial-text-muted)] italic font-mono uppercase tracking-widest tracking-[0.1em]">Verified Analysis Engine v2.4.0</p>
      </div>
    </motion.div>
  );
}

function MonitoringView() {
  const [logs, setLogs] = useState<{ id: string, time: string, event: string, cost: string, type: 'waste' | 'norm' }[]>([]);

  useEffect(() => {
    const events = [
      { event: 'Workflow: main.yml - Rerun triggered (Flaky)', cost: '$0.42', type: 'waste' },
      { event: 'Workflow: deploy.yml - Success', cost: '$1.12', type: 'norm' },
      { event: 'Workflow: tests.yml - Matrix expansion detected (Waste High)', cost: '$2.80', type: 'waste' },
      { event: 'Workflow: lint.yml - Cache Hit', cost: '$0.02', type: 'norm' },
    ];

    const interval = setInterval(() => {
      const e = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleTimeString(), ...e }, ...prev].slice(0, 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-12 py-16"
    >
      <div className="mb-12 space-y-4">
        <span className="editorial-label">System Module 02</span>
        <h2 className="text-4xl font-serif italic">Real-Time Waste Monitoring</h2>
        <p className="text-[var(--color-editorial-text-muted)] text-sm max-w-lg">
          Actively streaming GitHub Actions events to detect cost spikes and flaky patterns as they happen.
        </p>
      </div>

      <div className="editorial-card p-0 overflow-hidden shadow-2xl">
        <div className="bg-[var(--color-editorial-dark)] text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Integration Feed</span>
          </div>
          <div className="text-[10px] font-mono text-gray-400">v2.4-stable</div>
        </div>
        <div className="bg-white min-h-[400px] p-6 font-mono text-xs divide-y divide-[var(--color-editorial-border)]">
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-300 italic pt-20">Waiting for events...</div>
            ) : logs.map(log => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="py-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <span className="text-gray-400 tabular-nums">[{log.time}]</span>
                  <span className={cn(
                    "font-bold",
                    log.type === 'waste' ? "text-[var(--color-editorial-accent)]" : "text-green-600"
                  )}>
                    {log.event}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 italic">BURN:</span>
                  <span className="font-bold tabular-nums">{log.cost}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function FlakinessCalculatorView() {
  const [inputs, setInputs] = useState({
    engineers: 25,
    prsPerDay: 15,
    rerunsPerPr: 1.4,
    flakyRate: 12,
    runtime: 12, // minutes
  });

  const [results, setResults] = useState({
    wastedHours: 0,
    wastedSpend: 0,
    annualCost: 0,
  });

  useEffect(() => {
    // Math: Waste
    const dailyReruns = inputs.prsPerDay * (inputs.rerunsPerPr - 1);
    const dailyWasteMinutes = dailyReruns * inputs.runtime;
    const monthlyWasteHours = (dailyWasteMinutes * 22) / 60; // 22 working days
    
    // Spend: $0.008 per minute (standard ubuntu-latest)
    const monthlySpend = (dailyWasteMinutes * 22) * 0.008;
    
    // Engineering cost: $100/hr avg loaded cost
    const monthlyEngWaste = monthlyWasteHours * 100;
    
    setResults({
      wastedHours: Math.round(monthlyWasteHours),
      wastedSpend: Math.round(monthlySpend),
      annualCost: Math.round((monthlySpend + monthlyEngWaste) * 12),
    });
  }, [inputs]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-12 py-16"
    >
      <div className="mb-16 space-y-4">
        <span className="editorial-label">Calculator Module 04</span>
        <h2 className="text-4xl font-serif italic">CI Flakiness Economist</h2>
        <p className="text-[var(--color-editorial-text-muted)] text-sm max-w-lg">
          Estimate the invisible tax flaky tests are placing on your engineering organization.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="editorial-label border-b border-[var(--color-editorial-border)] pb-4">Variable Input</h3>
            <div className="grid gap-6">
              <CalcInput 
                label="Number of Engineers" 
                value={inputs.engineers} 
                onChange={(v) => setInputs(p => ({ ...p, engineers: v }))} 
              />
              <CalcInput 
                label="Avg PRs / Day" 
                value={inputs.prsPerDay} 
                onChange={(v) => setInputs(p => ({ ...p, prsPerDay: v }))} 
              />
              <CalcInput 
                label="Avg Reruns / PR" 
                step={0.1}
                value={inputs.rerunsPerPr} 
                onChange={(v) => setInputs(p => ({ ...p, rerunsPerPr: v }))} 
              />
              <CalcInput 
                label="Flaky Rate (%)" 
                value={inputs.flakyRate} 
                onChange={(v) => setInputs(p => ({ ...p, flakyRate: v }))} 
              />
              <CalcInput 
                label="Avg Job Runtime (min)" 
                value={inputs.runtime} 
                onChange={(v) => setInputs(p => ({ ...p, runtime: v }))} 
              />
            </div>
          </div>
        </div>

        <div className="editorial-card h-fit sticky top-32">
          <h3 className="editorial-label border-b border-[var(--color-editorial-border)] pb-4 mb-10">Calculated Impact</h3>
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase text-gray-500 mb-1">Monthly Engineering Waste</p>
                <div className="text-5xl font-serif">{results.wastedHours}h</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-gray-500 mb-1">Wasted CI Spend</p>
                <div className="text-4xl font-serif text-[var(--color-editorial-accent)]">${results.wastedSpend}<span className="text-sm italic text-gray-400">/mo</span></div>
              </div>
            </div>

            <div className="pt-10 border-t-2 border-[var(--color-editorial-dark)]">
              <p className="editorial-label text-center mb-4">Total Aggregate Annual Loss</p>
              <div className="text-7xl font-serif text-center italic leading-none">
                ${results.annualCost.toLocaleString()}
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-6 italic">
                Reflects both direct infrastructure spend and developer idle time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CalcInput({ label, value, onChange, step = 1 }: { label: string, value: number, onChange: (v: number) => void, step?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[var(--color-editorial-muted)]">
        <span>{label}</span>
        <span className="font-mono text-[var(--color-editorial-dark)]">{value}</span>
      </div>
      <input 
        type="range" 
        min={0} 
        max={label.includes('Rate') ? 100 : 500} 
        step={step}
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--color-editorial-dark)] bg-[var(--color-editorial-border)] h-1 rounded-full cursor-pointer"
      />
    </div>
  );
}

function DashboardView({ result }: { result: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'optimized'>('overview');

  const score = result?.score || 68;
  const savings = result?.potentialSavings || "18-22%";
  const findings = result?.findings || [];
  const optimizedYaml = result?.optimizedYaml || "# Optimized YAML Preview";

  const handleExport = () => {
    const data = JSON.stringify(result || { score, savings, findings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RunBurn_Audit_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-12 py-16"
    >
      <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-16 border-b border-[var(--color-editorial-border)] pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="editorial-label">Report ID: SCAN_9921_B</span>
            <button 
              onClick={() => window.print()}
              className="text-[9px] uppercase font-bold text-[var(--color-editorial-muted)] hover:text-black flex items-center gap-1 border border-transparent hover:border-[var(--color-editorial-border)] px-2 py-0.5"
            >
              <FileText size={10} />
              Print PDF
            </button>
            <button 
              onClick={handleExport}
              className="text-[9px] uppercase font-bold text-[var(--color-editorial-muted)] hover:text-black flex items-center gap-1 border border-transparent hover:border-[var(--color-editorial-border)] px-2 py-0.5"
            >
              <ArrowRight size={10} />
              Export JSON
            </button>
          </div>
          <h2 className="text-5xl font-serif italic text-[var(--color-editorial-dark)]">Efficiency Audit</h2>
          <p className="text-[var(--color-editorial-text-muted)] text-sm max-w-sm">Detailed analysis of your CI pipelines and cost drivers.</p>
        </div>
        
        <div className="flex gap-1">
          <div className="p-8 border border-[var(--color-editorial-dark)] bg-white min-w-[200px]">
            <div className="editorial-label mb-2">Audit Score</div>
            <div className="text-6xl font-serif italic text-[var(--color-editorial-dark)] leading-none">{score}<span className="text-xl text-[var(--color-editorial-accent)]">/100</span></div>
          </div>
          <div className="p-8 border border-[var(--color-editorial-dark)] border-l-0 bg-[var(--color-editorial-bg-alt)] min-w-[200px]">
            <div className="editorial-label mb-2">Net Savings</div>
            <div className="text-5xl font-serif italic text-[var(--color-editorial-accent)] leading-none">~{savings}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 border-b border-[var(--color-editorial-border)] mb-12">
        {(['overview', 'recommendations', 'optimized'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-[11px] uppercase tracking-[0.2em] font-bold transition-all relative",
              activeTab === tab ? "text-[var(--color-editorial-dark)]" : "text-[var(--color-editorial-muted)] hover:text-[var(--color-editorial-dark)]"
            )}
          >
            {tab}
            {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-[var(--color-editorial-accent)]" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2 space-y-12">
              <div className="editorial-card flex flex-col justify-center">
                <h4 className="editorial-label border-b border-[var(--color-editorial-border)] pb-4 mb-8">CI Waste Trajectory</h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WASTE_TIMELINE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="1 4" stroke="var(--color-editorial-border)" vertical={false} />
                      <XAxis dataKey="day" stroke="var(--color-editorial-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-editorial-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'var(--color-editorial-bg-alt)' }}
                        contentStyle={{ backgroundColor: 'white', border: '1px solid var(--color-editorial-dark)', borderRadius: '0', fontSize: '10px', fontStyle: 'italic', fontFamily: 'serif' }}
                      />
                      <Bar dataKey="waste" radius={0}>
                        {WASTE_TIMELINE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.waste > 400 ? 'var(--color-editorial-accent)' : 'var(--color-editorial-dark)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="editorial-card">
                <h4 className="editorial-label border-b border-[var(--color-editorial-border)] pb-4 mb-8">Runner Intensity Heatmap</h4>
                <div className="grid grid-cols-12 gap-1 h-32">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-[var(--color-editorial-dark)] hover:opacity-100 transition-opacity flex items-end p-1 group relative cursor-help"
                      style={{ opacity: 0.1 + (i % 8) * 0.15 }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                        Runner Load: {Math.round(10 + (i % 8) * 12)}% @ {i}:00
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:59</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="editorial-card min-h-[400px]">
                <h4 className="editorial-label border-b border-[var(--color-editorial-border)] pb-4 mb-8">Spend Matrix</h4>
                <div className="h-60 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={COST_DISTRIBUTION}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {COST_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {COST_DISTRIBUTION.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-2" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-mono text-[var(--color-editorial-text-muted)] uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-xs font-serif italic text-[var(--color-editorial-dark)]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <motion.div 
            key="recommendations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {findings.length > 0 ? findings.map((finding: any, i: number) => (
              <div key={i} className="editorial-card border-l-[6px] border-l-[var(--color-editorial-accent)] flex flex-col md:flex-row items-center gap-10">
                <div className="p-4 bg-[var(--color-editorial-bg-alt)] border border-[var(--color-editorial-border)] text-[var(--color-editorial-muted)]">
                   <AlertTriangle size={32} strokeWidth={1.5} />
                </div>
                <div className="flex-1 space-y-4">
                   <div className="flex items-center justify-between">
                     <h5 className="font-serif italic text-2xl text-[var(--color-editorial-dark)]">{finding.title}</h5>
                     <span className="editorial-label text-[9px] bg-[var(--color-editorial-bg-alt)] px-2 py-1">{finding.severity} priority</span>
                   </div>
                   <p className="text-[var(--color-editorial-text-muted)] text-sm italic">{finding.description}</p>
                   <div className="pt-4 border-t border-[var(--color-editorial-border)] flex items-start gap-4">
                      <span className="text-[10px] font-black text-[var(--color-editorial-muted)] uppercase tracking-widest">Correction:</span>
                      <p className="text-xs font-mono text-[var(--color-editorial-dark)]">{finding.suggestion}</p>
                   </div>
                </div>
              </div>
            )) : (
              <div className="editorial-card h-60 flex flex-center items-center justify-center text-[var(--color-editorial-muted)] italic serif">No findings detected for this workflow.</div>
            )}
          </motion.div>
        )}

        {activeTab === 'optimized' && (
          <motion.div 
            key="optimized"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="editorial-card p-1 shadow-[20px_20px_0px_var(--color-editorial-border)]"
          >
            <div className="bg-[var(--color-editorial-bg-alt)] border border-[var(--color-editorial-dark)] px-8 py-4 flex items-center justify-between border-b border-[var(--color-editorial-dark)]">
              <span className="editorial-label">Optimized_YAML_v1.0</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(optimizedYaml);
                  alert('Copied to clipboard!');
                }}
                className="text-[10px] font-bold text-[var(--color-editorial-muted)] hover:text-[var(--color-editorial-dark)] uppercase tracking-widest flex items-center gap-2"
              >
                <Clipboard size={12} />
                Copy Logic
              </button>
            </div>
            <pre className="p-10 text-[var(--color-editorial-dark)] font-mono text-[11px] h-[500px] overflow-auto leading-loose bg-white">
              <code>{optimizedYaml}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
         <StatItem label="Wait Waste" val="4.2h" />
         <StatItem label="Flaky Rate" val="12.4%" />
         <StatItem label="Fail Freq" val="8.9%" />
         <StatItem label="Idle Avg" val="4m" />
      </div>
    </motion.div>
  );
}

function StatItem({ label, val }: { label: string, val: string }) {
  return (
    <div className="p-8 editorial-card bg-transparent space-y-2">
       <span className="editorial-label opacity-60 text-[8px]">{label}</span>
       <div className="text-3xl font-serif italic text-[var(--color-editorial-dark)]">{val}</div>
    </div>
  );
}
