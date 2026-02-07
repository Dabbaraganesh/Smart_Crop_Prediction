import React, { useMemo } from 'react';
import { PredictionResult, CropInputs } from '../types';

interface ResultCardProps {
  result: PredictionResult;
  inputs: CropInputs;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, inputs }) => {
  const reportId = useMemo(() => {
    const prefix = "BA-INTEL";
    const timestamp = Date.now().toString(36).toUpperCase();
    const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${hash}`;
  }, []);

  const formatProfessionalText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2);
        const isMoney = cleanText.includes('₹') || cleanText.toLowerCase().includes('rupee');
        return (
          <span 
            key={i} 
            className={`font-bold ${
              isMoney 
                ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100' 
                : 'text-slate-900 border-b border-slate-200'
            }`}
          >
            {cleanText}
          </span>
        );
      }
      return part;
    });
  };

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 px-2 sm:px-0">
      {/* The Report Body */}
      <div 
        id="printable-report" 
        className="w-full bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-pearl flex flex-col overflow-hidden relative max-w-[900px] font-sans"
      >
        {/* Superior Royal Aesthetic Header Bar */}
        <div className="h-3 w-full bg-gradient-to-r from-[#064e3b] via-[#10b981] to-[#064e3b]"></div>

        <header className="px-8 py-10 md:px-16 md:py-16 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="flex flex-col gap-6 max-w-lg w-full">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl transform -rotate-6 border-2 border-emerald-500/30">
                <i className="fa-solid fa-wheat-awn text-emerald-400 text-3xl"></i>
              </div>
              <div className="flex flex-col">
                <h3 className="text-slate-900 font-black text-sm uppercase tracking-[0.4em] leading-none">Bharat Agri-AI</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">National Precision Intelligence Unit</p>
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="royal-serif text-4xl md:text-6xl text-slate-900 tracking-tight leading-[1.1]">
                Technical <span className="italic text-emerald-700 underline decoration-emerald-200 underline-offset-8">Report</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.1em]">Verified Agricultural Analysis & Market Projections</p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto self-end md:self-start">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl w-full md:w-auto shadow-inner">
              <div className="grid grid-cols-2 md:grid-cols-1 gap-5">
                <div className="flex flex-col items-start md:items-end">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</span>
                   <span className="text-slate-900 font-mono text-xs font-bold tracking-tighter">{reportId}</span>
                </div>
                <div className="h-px bg-slate-200 w-full hidden md:block"></div>
                <div className="flex flex-col items-end md:items-end">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dispatch Date</span>
                   <span className="text-slate-900 font-bold text-xs">{dateStr}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 md:px-16 pb-16 space-y-12 flex-grow">
          {/* Main Prediction Hero Area */}
          <section className="text-center py-12 md:py-20 bg-emerald-50/20 rounded-[3rem] border border-emerald-100/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <i className="fa-solid fa-leaf text-9xl text-emerald-900 rotate-12"></i>
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.6em] mb-4 block">Optimal Selection</span>
            <h2 className="text-5xl md:text-8xl font-black text-slate-900 royal-serif tracking-tighter leading-none px-4 drop-shadow-sm mb-4">
              {result.recommendedCrop}
            </h2>
            <div className="mt-10 flex justify-center items-center gap-8 text-slate-300">
               <div className="h-px w-20 bg-current"></div>
               <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-emerald-600 text-xl">
                 <i className="fa-solid fa-certificate"></i>
               </div>
               <div className="h-px w-20 bg-current"></div>
            </div>
          </section>

          {/* Precision Input Metadata Grid */}
          <section className="bg-slate-50/70 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center flex items-center justify-center gap-3">
               <span className="w-8 h-px bg-slate-200"></span>
               Field Parameters Analyzed
               <span className="w-8 h-px bg-slate-200"></span>
             </h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { label: 'Location Context', val: inputs.city, icon: 'fa-location-dot', c: 'text-red-500' },
                 { label: 'Thermal Index', val: `${inputs.temperature}°C`, icon: 'fa-temperature-high', c: 'text-orange-500' },
                 { label: 'Moisture Level', val: `${inputs.humidity}%`, icon: 'fa-droplet', c: 'text-blue-500' },
                 { label: 'Soil Acidity', val: `pH ${inputs.ph}`, icon: 'fa-vial', c: 'text-purple-500' },
               ].map((d, i) => (
                 <div key={i} className="flex flex-col gap-2 group">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-600 transition-colors">
                     <i className={`fa-solid ${d.icon} ${d.c} text-[8px]`}></i> {d.label}
                   </span>
                   <span className="text-sm font-extrabold text-slate-800 break-words leading-tight">{d.val || 'Unspecified'}</span>
                 </div>
               ))}
             </div>
          </section>

          {/* Qualitative Data Blocks */}
          <div className="flex flex-col gap-12 md:gap-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl border-b-4 border-slate-700">01</div>
                <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.2em]">Scientific Foundation</h4>
              </div>
              <div className="pl-0 md:pl-16">
                <div className="text-slate-600 text-xl md:text-3xl leading-relaxed font-medium royal-serif italic">
                  {formatProfessionalText(result.reason)}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl border-b-4 border-emerald-800">02</div>
                <h4 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.2em]">Economic Outlook</h4>
              </div>
              <div className="pl-0 md:pl-16">
                <div className="p-8 md:p-12 bg-emerald-50/30 border-2 border-emerald-100/50 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-100/20 -mr-24 -mb-24 rounded-full transition-transform group-hover:scale-125 duration-700"></div>
                  <div className="text-slate-800 text-xl md:text-3xl font-bold leading-relaxed relative z-10">
                    {formatProfessionalText(result.productivityBenefit)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation & Disclosure Footer */}
          <footer className="pt-12 border-t border-slate-100 mt-12 flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="max-w-md space-y-6 w-full">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 gold-seal-gradient rounded-full border-4 border-white shadow-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                    <i className="fa-solid fa-shield-check text-amber-950 text-4xl"></i>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] text-slate-900 font-black uppercase tracking-widest">Official AI Grounding</p>
                    <p className="text-[9px] text-slate-400 font-bold leading-relaxed italic">
                      This report is generated using advanced multi-modal reasoning fused with verified regional Mandi indices. Content is provided for educational and decision-support purposes.
                    </p>
                 </div>
              </div>
              
              {/* Grounding Sources (If Available) */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-2 pt-4">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Reference Verification Links</span>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.slice(0, 3).map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" className="text-[8px] font-bold px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg hover:text-emerald-600 transition-colors">
                        {s.title.substring(0, 25)}...
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-64 flex flex-col items-center md:items-end gap-6">
               <div className="relative w-full h-16 flex items-center justify-center md:justify-end">
                  <span className="royal-serif text-3xl text-slate-100 italic select-none pointer-events-none">Bharat Intel Agency</span>
                  <div className="absolute bottom-4 w-full h-px bg-slate-900/10"></div>
               </div>
               <div className="text-center md:text-right">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Agricultural System Architect</span>
                  <div className="flex items-center justify-center md:justify-end gap-2 mt-2">
                    <i className="fa-solid fa-fingerprint text-emerald-600 text-base"></i>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tamper-Proof Digital Seal</span>
                  </div>
               </div>
            </div>
          </footer>
          
          {/* Absolute Bottom Disclaimer (Print Only Style) */}
          <div className="pt-8 text-center border-t border-slate-50">
             <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xl mx-auto">
               Disclaimer: Agricultural outcomes depend on multiple dynamic variables including seed quality, irrigation consistency, and localized weather shifts. BHARAT AGRI-AI takes no liability for actual yield variations.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;