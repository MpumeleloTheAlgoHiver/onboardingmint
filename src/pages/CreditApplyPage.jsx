import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Landmark, Zap, Briefcase, ChevronDown, ChevronUp, 
  Info, AlertCircle, ShieldCheck, CheckCircle2, TrendingUp, 
  ArrowRight, HandCoins, Table, BadgeCheck
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useProfile } from "../lib/useProfile";

const CreditResultView = ({ score, isCalculating, onNext, categories }) => {
  const [showScoreDropdown, setShowScoreDropdown] = useState(false);

  const approvalStatus = useMemo(() => {
    if (score >= 80) return { label: "PRE APPROVED", color: "text-emerald-500", band: "A" };
    if (score >= 70) return { label: "PRE APPROVED", color: "text-blue-500", band: "B" };
    if (score >= 50) return { label: "MANUAL REVIEW", color: "text-amber-500", band: "C" };
    return { label: "DECLINED", color: "text-red-500", band: "D" };
  }, [score]);

  const center = 100;
  const radius = 80;
  const angleStep = (Math.PI * 2) / categories.length;
  
  const radarPoints = useMemo(() => {
    return categories.map((c, i) => {
      const angle = (i * angleStep) - (Math.PI / 2);
      const r = (c.value / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  }, [categories, angleStep, radius]);

  return (
    <div className="flex flex-col items-center px-6 pb-10 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-sm font-bold tracking-[0.3em] uppercase mb-8">Score</h2>
      
      <div className="relative flex items-center justify-center w-full max-w-[300px] aspect-square border-2 border-blue-400 p-4 rounded-xl mb-6">
        <svg viewBox="0 0 200 140" className="w-full h-full scale-110">
          <path d="M30,120 A80,80 0 0,1 170,120" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
          <path 
            d="M30,120 A80,80 0 0,1 170,120" fill="none" stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round" 
            strokeDasharray="219.9" strokeDashoffset={219.9 - (219.9 * score) / 100}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff00cc" /><stop offset="100%" stopColor="#3333ff" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center pt-4">
          {isCalculating || score === 0 ? (
            <img src="/assets/images/coinAlgoMoney.png" alt="Coin" className={`h-28 w-28 object-contain ${isCalculating ? 'animate-pulse' : ''}`} />
          ) : (
            <div className="text-center animate-in zoom-in-50 duration-500">
              <h3 className="text-6xl font-light tracking-tighter text-slate-900">{score}%</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">TRS Result</p>
            </div>
          )}
        </div>
      </div>

      <h3 className={`text-2xl font-black tracking-tight mb-8 ${approvalStatus.color}`}>
        {isCalculating ? "CALCULATING..." : approvalStatus.label}
      </h3>

      {!isCalculating && score > 0 && (
        <>
          <button onClick={onNext} className="w-full py-5 bg-slate-200 text-slate-900 rounded-xl font-bold uppercase tracking-widest text-sm mb-12 shadow-sm active:scale-95 transition-all">
            Configure Amount
          </button>

          <div className="w-full border-t border-slate-100 pt-6">
            <button onClick={() => setShowScoreDropdown(!showScoreDropdown)} className="w-full flex items-center justify-between py-2">
              <span className="text-lg font-bold tracking-tight uppercase">Score Details</span>
              <div className="bg-black text-white p-1 rounded-sm">
                {showScoreDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {showScoreDropdown && (
              <div className="mt-8 space-y-10 animate-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col items-center bg-slate-50/50 rounded-[40px] py-10 border border-slate-100">
                  <svg width="220" height="200" viewBox="0 0 200 200">
                    {[0.25, 0.5, 0.75, 1].map((m) => (
                      <circle key={m} cx="100" cy="100" r={80 * m} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    ))}
                    <polygon points={radarPoints} fill="rgba(51, 51, 255, 0.15)" stroke="#3333ff" strokeWidth="2" strokeLinejoin="round" />
                    {categories.map((f, i) => {
                      const angle = (i * angleStep) - (Math.PI / 2);
                      return (
                        <text key={i} x={100 + 95 * Math.cos(angle)} y={100 + 95 * Math.sin(angle)} textAnchor="middle" className="text-[7px] font-bold fill-slate-400 uppercase">
                          {f.label}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Table size={12} /> Individual Metric breakdown
                  </h4>
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="border-b border-slate-50 last:border-0 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-tighter text-slate-900">{cat.label}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{cat.weight} Weight</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {cat.metrics.map(m => (
                            <div key={m.name} className="bg-slate-50 p-2 rounded-lg">
                              <p className="text-[8px] text-slate-400 uppercase font-medium truncate">{m.name}</p>
                              <p className="text-xs font-bold text-slate-700">{m.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const CreditConfigureView = ({ riskProfile }) => {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 pt-4 pb-10 animate-in fade-in">
      <div className={`rounded-[36px] bg-gradient-to-br ${riskProfile.color === 'text-emerald-500' ? 'from-emerald-500' : riskProfile.color === 'text-blue-500' ? 'from-blue-500' : 'from-amber-500'} to-slate-900 p-8 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Max Approved Allocation</p>
        <h4 className="text-5xl font-light tracking-tight">R 15,000</h4>
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
          <div><p className="text-[10px] uppercase text-white/50 tracking-wider">Interest Rate</p><p className="text-lg font-semibold">{riskProfile.rate}</p></div>
          <div className="text-right"><p className="text-[10px] uppercase text-white/50 tracking-wider">Risk Band</p><p className="text-lg font-semibold uppercase">{riskProfile.band}</p></div>
        </div>
      </div>
      <section className="space-y-4">
        <h3 className="text-sm font-semibold px-2 text-slate-900 uppercase tracking-wider">Repayment Installments</h3>
        {[
          { label: "3 Months", value: "R 5,450 /mo", active: true },
          { label: "6 Months", value: "R 2,820 /mo", active: false }
        ].map((opt) => (
          <button key={opt.label} className={`flex w-full items-center justify-between rounded-2xl p-4 transition-all ${opt.active ? 'bg-white shadow-md ring-2 ring-slate-900' : 'bg-slate-100 text-slate-500'}`}>
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${opt.active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}><HandCoins className="h-4 w-4" /></div>
              <span className="font-semibold text-slate-700">{opt.label}</span>
            </div>
            <span className="font-bold text-slate-900">{opt.value}</span>
          </button>
        ))}
      </section>
      <button className="w-full py-4 bg-slate-900 text-white rounded-full text-sm font-semibold uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
        Finalize Application <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const CreditApplyPage = ({ onBack }) => {
  const { profile, loading: profileLoading } = useProfile();
  const [step, setStep] = useState(0); 
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const [score, setScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const categories = useMemo(() => [
    { label: 'Credit Profile', value: 85, weight: '40%', metrics: [{ name: 'Bureau Score', val: '80/100' }, { name: 'Utilization', val: '95/100' }, { name: 'Adverse', val: '100/100' }] },
    { label: 'Affordability', value: 90, weight: '30%', metrics: [{ name: 'Stability', val: '100/100' }, { name: 'DTI Ratio', val: '90/100' }, { name: 'Cashflows', val: '80/100' }] },
    { label: 'Stability', value: 75, weight: '15%', metrics: [{ name: 'Tenure', val: '75/100' }, { name: 'Employer', val: '80/100' }, { name: 'Contract', val: '100/100' }] },
    { label: 'Behavioral', value: 65, weight: '15%', metrics: [{ name: 'AlgoHive', val: '65/100' }, { name: 'Repayment', val: '50/100' }, { name: 'App Behavior', val: '100/100' }] }
  ], []);

  const riskProfile = useMemo(() => {
    if (score >= 80) return { band: "A", label: "Auto-Approved", color: "text-emerald-500", rate: "Prime + 8%" };
    if (score >= 70) return { band: "B", label: "Approved", color: "text-blue-500", rate: "Prime + 10%" };
    if (score >= 50) return { band: "C", label: "Manual Review", color: "text-amber-500", rate: "Prime + 12%" };
    return { band: "D", label: "Declined", color: "text-red-500", rate: "N/A" };
  }, [score]);

  useEffect(() => {
    const checkExistingScore = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('user_onboarding')
        .select('total_risk_score')
        .eq('user_id', profile.id)
        .single();
      
      if (data?.total_risk_score) {
        setScore(data.total_risk_score);
        setStep(4); 
      }
    };
    if (!profileLoading) checkExistingScore();
  }, [profile, profileLoading]);

  const allFields = [
    { id: 'id_number', table: 'profiles', label: 'ID Number', type: 'text', placeholder: '5-20 digits' },
    { id: 'employment_status', table: 'user_onboarding', label: 'Employment Status', type: 'select' },
    { id: 'employer_name', table: 'user_onboarding', label: 'Employer Name', type: 'text', placeholder: 'Company name' },
    { id: 'employment_type', table: 'user_onboarding', label: 'Employment Type', type: 'select' }
  ];

  const handleInputChange = (id, value) => {
    const sanitizedValue = id === 'id_number' ? value.replace(/\D/g, '') : value;
    setFormData(prev => ({ ...prev, [id]: sanitizedValue }));
  };

  const isFormValid = () => {
    return !!formData.id_number && !!formData.employment_status && !!formData.employer_name;
  };

  const saveMissingData = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 1000);
  };

  const runScoreSimulation = () => {
    setIsCalculating(true);
    let start = 0;
    const target = 78;
    const timer = setInterval(() => {
      start += 2;
      if (start >= target) {
        setScore(target);
        setIsCalculating(false);
        clearInterval(timer);
      } else {
        setScore(start);
      }
    }, 30);
  };

  if (profileLoading) return <div className="flex min-h-screen items-center justify-center font-sans text-slate-400">Loading Assessment...</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="relative z-20 flex items-center justify-center px-6 pt-10 pb-6">
        <button
          onClick={() => step === 0 ? onBack() : setStep(step - 1)}
          className="absolute left-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center flex flex-col items-center">
          {step !== 0 && <span className="mint-brand text-xs font-semibold tracking-[0.2em] uppercase">Mint</span>}
        </div>
      </header>

      {step === 0 && (
        <div className="flex flex-col items-center px-6 pb-10 animate-in fade-in slide-in-from-top-4">
          <div className="mb-6" style={{ animation: 'subtleBounce 3s ease-in-out infinite' }}>
            <img src="/assets/images/coinAlgoMoney.png" alt="Mint" className="h-24 w-24 object-contain drop-shadow-xl" />
            <style>{`@keyframes subtleBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-center">
            Welcome to <span className="mint-brand font-semibold uppercase">Mint</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-3 text-center max-w-[320px]">
            Sophisticated credit solutions tailored to your financial profile.
          </p>
          <div className="w-full mt-8 space-y-4">
            {[
              { icon: <Briefcase className="h-5 w-5" />, title: "1. Employment Verification", desc: "Confirming occupational stability." },
              { icon: <Landmark className="h-5 w-5" />, title: "2. Financial Integration", desc: "Secure data exchange via TruID." },
              { icon: <Zap className="h-5 w-5" />, title: "3. Proprietary Scoring", desc: "Real-time affordability assessment." }
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">{s.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">{s.title}</h3>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowDetails(!showDetails)} className="mt-6 flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-[0.15em] hover:text-slate-600 transition">
            <Info className="h-4 w-4" /> How it works {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showDetails && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50/50 text-[11px] text-slate-500 leading-relaxed animate-in fade-in zoom-in-95 border border-slate-100">
              Our automated credit engine utilizes high-fidelity data from **Experian** and granular cash-flow analysis provided via TruID. 
              By assessing debt-to-income ratios and historical repayment behavior, we ensure alignment with National Credit Act affordability mandates.
            </div>
          )}
          <button onClick={() => setStep(1)} className="w-full py-4 bg-slate-900 text-white rounded-full text-sm font-semibold uppercase tracking-[0.2em] shadow-lg mt-8 active:scale-95 transition-all">
            Initiate Application
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Briefcase className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-light tracking-tight text-slate-900">KYC & Employment</h2>
            <p className="text-sm text-muted-foreground mt-2">Submit your credentials for initial eligibility screening.</p>
          </div>
          <div className="space-y-4">
            {allFields.map((field) => (
              <div key={field.id} className="relative">
                <div className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-slate-900 transition-colors`}>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{field.label}</p>
                  {field.type === 'select' ? (
                    <select className="w-full mt-1 text-base font-semibold text-slate-900 outline-none bg-transparent appearance-none" onChange={(e) => handleInputChange(field.id, e.target.value)} value={formData[field.id] || ''}>
                      <option value="">Select Category</option>
                      <option value="Employed">Permanent Employment</option>
                      <option value="Self-Employed">Self-Employed / Professional</option>
                    </select>
                  ) : (
                    <input type={field.type} maxLength={field.id === 'id_number' ? 20 : 100} placeholder={field.placeholder} className="w-full mt-1 text-base font-semibold text-slate-900 outline-none bg-transparent" onChange={(e) => handleInputChange(field.id, e.target.value)} value={formData[field.id] || ''} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={saveMissingData} disabled={!isFormValid()} className="w-full py-4 bg-slate-900 text-white rounded-full text-sm font-semibold uppercase tracking-[0.2em] shadow-lg mt-8 active:scale-95 transition-all">
            Continue to Integration
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Landmark className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-light tracking-tight text-slate-900 text-center">Financial Aggregation</h2>
            <p className="text-sm text-muted-foreground mt-2">Establish a secure link for cash-flow verification.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 space-y-4">
            <div className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 text-green-500 shrink-0" /><p className="text-sm text-slate-600">Encrypted transmission via bank-grade protocols.</p></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /><p className="text-sm text-slate-600">Automated income and affordability validation.</p></div>
          </div>
          <button onClick={() => { setStep(3); runScoreSimulation(); }} className="w-full py-4 bg-indigo-600 text-white rounded-full text-sm font-semibold uppercase tracking-[0.2em] shadow-xl mt-8">
            Authorize TruID Session
          </button>
        </div>
      )}

      {step === 3 && (
        <CreditResultView 
          score={score} 
          isCalculating={isCalculating} 
          onNext={() => setStep(4)} 
          categories={categories}
        />
      )}

      {step === 4 && (
        <CreditConfigureView riskProfile={riskProfile} />
      )}
    </div>
  );
};

export default CreditApplyPage;
