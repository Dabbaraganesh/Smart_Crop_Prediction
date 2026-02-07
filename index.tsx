import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- Types ---
type SupportedLanguage = 'English' | 'Hindi' | 'Telugu' | 'Tamil' | 'Kannada' | 'Marathi' | 'Bengali' | 'Malayalam' | 'Punjabi' | 'Gujarati' | 'Odia' | 'Assamese';

interface CropInputs {
  city: string;
  temperature: string;
  humidity: string;
  rainfall: string;
  ph: string;
  language: SupportedLanguage;
}

interface GroundingSource {
  title: string;
  uri: string;
}

interface PredictionResult {
  recommendedCrop: string;
  reason: string;
  productivityBenefit: string;
  sources?: GroundingSource[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- Components ---

const ChatBot: React.FC<{ language: SupportedLanguage }> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const greetings: Record<string, string> = {
    English: "Namaste! I am Bharat Agri-AI Pro. Ask me about soil health, crop diseases, or Mandi rates.",
    Hindi: "नमस्ते! मैं भारत एग्री-एआई प्रो हूं। मिट्टी के स्वास्थ्य, फसल रोगों या मंडी दरों के बारे में पूछें।",
    Telugu: "నమస్తే! నేను భారత్ అగ్రి-AI ప్రో. నేల ఆరోగ్యం, పంట వ్యాధులు లేదా మండి ధరల గురించి అడగండి."
  };

  useEffect(() => {
    setMessages([{ role: 'model', text: greetings[language] || greetings['English'] }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const msg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', text: msg }]);
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, language })
      });
      const data = await res.json();
      setMessages(p => [...p, { role: 'model', text: data.text }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'model', text: "Service busy. Try later." }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[320px] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
            <span className="font-black text-xs uppercase tracking-widest">Agri-Advisor Pro</span>
            <button onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border shadow-sm text-slate-800'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] animate-pulse">Analyzing...</div>}
          </div>
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type here..." className="flex-1 bg-slate-100 rounded-xl px-4 py-2 outline-none" />
            <button type="submit" className="bg-slate-900 text-white w-10 h-10 rounded-xl"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all">
        <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-headset'}`}></i>
      </button>
    </div>
  );
};

const ResultCard: React.FC<{ result: PredictionResult; inputs: CropInputs }> = ({ result, inputs }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const reportId = useMemo(() => `BA-${Math.random().toString(36).substring(7).toUpperCase()}`, []);

  const downloadPDF = async () => {
    const el = document.getElementById('report-content');
    if (!el) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`BharatAgri_${result.recommendedCrop}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <div id="report-content" className="bg-white rounded-[2.5rem] border shadow-pearl overflow-hidden">
        <div className="h-3 w-full bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900"></div>
        <div className="p-8 md:p-12 space-y-10">
          <header className="flex justify-between items-start border-b pb-8">
            <div>
              <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest block mb-2">Recommendation Report</span>
              <h2 className="royal-serif text-4xl md:text-6xl font-black text-slate-900 leading-none">
                {result.recommendedCrop}
              </h2>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black text-slate-300 uppercase">ID: {reportId}</span>
              <span className="text-[10px] font-bold text-emerald-600">{new Date().toLocaleDateString()}</span>
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-3xl">
             <div><span className="text-[8px] uppercase text-slate-400 font-black block mb-1">Location</span><span className="font-bold text-sm">{inputs.city}</span></div>
             <div><span className="text-[8px] uppercase text-slate-400 font-black block mb-1">Temp</span><span className="font-bold text-sm">{inputs.temperature}°C</span></div>
             <div><span className="text-[8px] uppercase text-slate-400 font-black block mb-1">Rainfall</span><span className="font-bold text-sm">{inputs.rainfall}mm</span></div>
             <div><span className="text-[8px] uppercase text-slate-400 font-black block mb-1">pH</span><span className="font-bold text-sm">{inputs.ph}</span></div>
          </div>

          <div className="space-y-8">
             <div className="space-y-3">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <i className="fa-solid fa-microscope text-emerald-600"></i> Scientific Rationale
               </h4>
               <p className="text-slate-600 leading-relaxed italic royal-serif text-lg">{result.reason}</p>
             </div>
             <div className="space-y-3">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <i className="fa-solid fa-chart-line text-emerald-600"></i> Productivity & Market Potential
               </h4>
               <div className="p-6 bg-emerald-900 text-emerald-50 rounded-3xl">
                 <p className="text-lg font-bold">{result.productivityBenefit}</p>
               </div>
             </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <footer className="pt-8 border-t flex flex-wrap gap-3">
              {result.sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[9px] font-bold px-3 py-1.5 bg-slate-50 rounded-full border hover:bg-emerald-50 transition-colors">
                  <i className="fa-solid fa-link mr-1"></i> {s.title.substring(0, 20)}...
                </a>
              ))}
            </footer>
          )}
        </div>
      </div>
      
      <button onClick={downloadPDF} disabled={isDownloading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all">
        {isDownloading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
        {isDownloading ? 'Generating Report...' : 'Download Analysis PDF'}
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CropInputs>({ city: '', temperature: '28', humidity: '70', rainfall: '1000', ph: '6.5', language: 'English' });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      const data = await res.json();
      setInputs(p => ({ ...p, city: data.address.city || data.address.state || "Detected Location" }));
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-10 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl mx-auto flex items-center justify-center border transform -rotate-6">
            <i className="fa-solid fa-wheat-awn text-3xl text-emerald-600"></i>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
            BHARAT <span className="text-emerald-600">AGRI-AI</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">National Precision Advisor</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <section className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-pearl border space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <i className="fa-solid fa-leaf text-emerald-600"></i> Field Metrics
            </h3>
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</label>
                <select value={inputs.language} onChange={e => setInputs(p => ({ ...p, language: e.target.value as SupportedLanguage }))} className="w-full p-3 rounded-xl border-2 border-slate-50 font-bold focus:border-emerald-500 outline-none appearance-none bg-slate-50">
                  {['English', 'Hindi', 'Telugu', 'Tamil', 'Marathi'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                   <button type="button" onClick={handleDetect} className="text-[9px] font-bold text-emerald-600 uppercase">Detect Auto</button>
                </div>
                <input type="text" value={inputs.city} onChange={e => setInputs(p => ({ ...p, city: e.target.value }))} placeholder="District/City" className="w-full p-3 rounded-xl border-2 border-slate-50 font-bold focus:border-emerald-500 outline-none bg-slate-50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['temperature', 'humidity', 'rainfall', 'ph'].map(f => (
                  <div key={f} className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">{f}</label>
                    <input type="number" step="0.1" value={inputs[f as keyof CropInputs]} onChange={e => setInputs(p => ({ ...p, [f]: e.target.value }))} className="w-full p-3 rounded-xl border-2 border-slate-50 font-bold focus:border-emerald-500 outline-none bg-slate-50" required />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all disabled:bg-slate-300">
                {isLoading ? 'Syncing Markets...' : 'Analyze Market Potential'}
              </button>
            </form>
          </section>

          <section className="lg:col-span-8 min-h-[500px]">
             {isLoading ? (
               <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                  <h4 className="font-black text-slate-900 text-xl tracking-tight">Accessing Agricultural Repositories...</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Checking Mandi indices for {inputs.city}</p>
               </div>
             ) : result ? (
               <ResultCard result={result} inputs={inputs} />
             ) : error ? (
               <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center">
                 <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-4"></i>
                 <h4 className="font-black text-red-900">Analysis Halted</h4>
                 <p className="text-red-700 text-sm mt-2">{error}</p>
                 <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">Retry Connection</button>
               </div>
             ) : (
               <div className="h-full bg-white rounded-[2.5rem] border flex flex-col items-center justify-center p-12 text-center group">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 group-hover:text-emerald-500 transition-all duration-700">
                   <i className="fa-solid fa-map-location-dot text-5xl"></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Data Integrity Unit</h3>
                 <p className="text-slate-400 font-medium max-w-sm mt-4 text-sm leading-relaxed">Please provide soil and weather metrics for your local district to initiate the precision agriculture forecast.</p>
               </div>
             )}
          </section>
        </div>
      </div>
      <ChatBot language={inputs.language} />
    </div>
  );
};

// Start the application
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);