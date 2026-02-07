import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

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

// --- Services ---
const getCropRecommendation = async (inputs: CropInputs): Promise<PredictionResult> => {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Prediction service error");
  }
  return await response.json();
};

const sendChatMessage = async (message: string, language: SupportedLanguage) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language })
  });
  if (!response.ok) throw new Error("Chat unavailable");
  return await response.json();
};

// --- Components ---

const InputSection: React.FC<{
  inputs: CropInputs;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onLocationDetected: (city: string) => void;
}> = ({ inputs, onChange, onSubmit, isLoading, onLocationDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.state || "Detected Location";
        onLocationDetected(city);
      } catch (e) {
        onLocationDetected("India");
      } finally { setIsDetecting(false); }
    }, () => setIsDetecting(false));
  };

  const fields = [
    { label: 'Temp (°C)', name: 'temperature', icon: 'fa-temperature-high', color: 'text-orange-500' },
    { label: 'Humidity (%)', name: 'humidity', icon: 'fa-droplet', color: 'text-blue-500' },
    { label: 'Rain (mm)', name: 'rainfall', icon: 'fa-cloud-showers-heavy', color: 'text-indigo-500' },
    { label: 'Soil pH', name: 'ph', icon: 'fa-flask', color: 'text-purple-500' },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-language text-emerald-600"></i> Language / भाषा
          </label>
          <select name="language" value={inputs.language} onChange={onChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-emerald-500 appearance-none bg-white">
            {['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-red-500"></i> Location
            </label>
            <button type="button" onClick={handleDetectLocation} className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">
              {isDetecting ? 'Detecting...' : 'Detect Auto'}
            </button>
          </div>
          <input type="text" name="city" value={inputs.city} onChange={onChange} placeholder="e.g. Nagpur" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold focus:border-emerald-500 outline-none" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.name} className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i className={`fa-solid ${f.icon} ${f.color}`}></i> {f.label}
            </label>
            <input type="number" step="0.1" name={f.name} value={inputs[f.name as keyof CropInputs]} onChange={onChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold focus:border-emerald-500 outline-none" required />
          </div>
        ))}
      </div>
      <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-lg transition-all ${isLoading ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'}`}>
        {isLoading ? 'Processing...' : 'Generate Report'}
      </button>
    </form>
  );
};

const ResultCard: React.FC<{ result: PredictionResult; inputs: CropInputs }> = ({ result, inputs }) => {
  const reportId = useMemo(() => `BA-${Math.random().toString(36).substring(7).toUpperCase()}`, []);
  
  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-slate-200 shadow-pearl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="h-2 w-full bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900"></div>
      <div className="p-8 md:p-12 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-50 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-wheat-awn text-emerald-400"></i></div>
              <span className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Bharat Agri-AI Pro</span>
            </div>
            <h2 className="royal-serif text-4xl md:text-5xl text-slate-900 font-black tracking-tight leading-tight">
              Optimal Choice: <span className="text-emerald-700 underline decoration-emerald-100">{result.recommendedCrop}</span>
            </h2>
          </div>
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-right">
             <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</span>
             <span className="font-mono text-xs font-bold text-slate-800">{reportId}</span>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-emerald-50/20 p-6 rounded-3xl border border-emerald-100/50">
          {[
            { label: 'Location', val: inputs.city, icon: 'fa-location-dot' },
            { label: 'Temperature', val: `${inputs.temperature}°C`, icon: 'fa-temperature-half' },
            { label: 'Rainfall', val: `${inputs.rainfall}mm`, icon: 'fa-cloud-rain' },
            { label: 'pH Value', val: inputs.ph, icon: 'fa-flask' },
          ].map((d, i) => (
            <div key={i} className="space-y-1">
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><i className={`fa-solid ${d.icon} text-[10px]`}></i> {d.label}</span>
              <span className="text-xs font-black text-slate-800 block truncate">{d.val}</span>
            </div>
          ))}
        </div>

        <div className="space-y-8">
           <div className="space-y-4">
             <div className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-900 rounded-lg text-white flex items-center justify-center font-black text-[10px]">01</div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scientific Rationale</h4></div>
             <p className="royal-serif text-lg md:text-xl text-slate-600 leading-relaxed italic pl-0 md:pl-11">{result.reason}</p>
           </div>
           <div className="space-y-4">
             <div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-600 rounded-lg text-white flex items-center justify-center font-black text-[10px]">02</div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Economic Analysis</h4></div>
             <div className="p-8 bg-emerald-900 text-emerald-50 rounded-[2rem] shadow-xl relative overflow-hidden pl-8 md:ml-11">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/20 rounded-bl-[5rem]"></div>
                <p className="text-lg md:text-2xl font-bold leading-relaxed relative z-10">{result.productivityBenefit}</p>
             </div>
           </div>
        </div>

        {result.sources && result.sources.length > 0 && (
          <footer className="pt-8 border-t border-slate-50 space-y-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">Verified Data Sources (Live Grounding)</span>
            <div className="flex flex-wrap justify-center gap-3">
              {result.sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" className="text-[9px] font-bold px-4 py-2 bg-slate-50 border border-slate-100 rounded-full hover:bg-emerald-50 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-link text-[10px] text-emerald-600"></i> {s.title.substring(0, 30)}...
                </a>
              ))}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

const ChatBot: React.FC<{ language: SupportedLanguage }> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'model', text: `Namaste! I am Bharat AI Pro. How can I assist you with your farming in ${language}?` }]);
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
      const res = await sendChatMessage(msg, language);
      setMessages(p => [...p, { role: 'model', text: res.text }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'model', text: "Service busy. Please try later." }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] md:w-[450px] h-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><i className="fa-solid fa-brain"></i></div>
              <span className="font-black text-[10px] uppercase tracking-widest">Agri-Advisor Pro</span>
            </div>
            <button onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white border border-slate-100 rounded-bl-none shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing...</div>}
          </div>
          <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your query..." className="flex-1 bg-slate-100 rounded-xl px-4 py-3 outline-none text-sm" />
            <button type="submit" className="bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all"><i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-headset'} text-xl`}></i></button>
    </div>
  );
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CropInputs>({ city: '', temperature: '28', humidity: '70', rainfall: '1000', ph: '6.5', language: 'English' });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCropRecommendation(inputs);
      setResult(res);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto shadow-xl flex items-center justify-center border border-slate-100 -rotate-3"><i className="fa-solid fa-wheat-awn text-4xl text-emerald-600"></i></div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">BHARAT <span className="text-emerald-600">AGRI-AI</span></h1>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.5em] opacity-80">Precision Intelligence for Indian Farmers</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-pearl border border-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="mb-8"><h3 className="text-2xl font-black text-slate-900">Farm Metrics</h3><div className="w-8 h-1 bg-emerald-500 mt-1"></div></div>
            <InputSection inputs={inputs} onChange={e => setInputs(p => ({ ...p, [e.target.name]: e.target.value }))} onSubmit={handleSubmit} isLoading={isLoading} onLocationDetected={c => setInputs(p => ({ ...p, city: c }))} />
          </section>
          
          <section className="lg:col-span-8 min-h-[500px]">
            {isLoading ? (
              <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center text-center p-10">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                <h4 className="text-xl font-black text-slate-900">Analyzing Regional Data...</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Fetching live Mandi indices for {inputs.city}</p>
              </div>
            ) : result ? (
              <ResultCard result={result} inputs={inputs} />
            ) : error ? (
              <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center">
                <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-4"></i>
                <h4 className="text-xl font-black text-red-900">Service Error</h4>
                <p className="text-red-700 text-sm mt-2">{error}</p>
              </div>
            ) : (
              <div className="h-full bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center p-12 text-center group">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-700">
                   <i className="fa-solid fa-map-location-dot text-5xl"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ready for Intelligence</h3>
                <p className="text-slate-400 font-medium max-w-sm mt-4">Provide your local district and soil metrics to generate a professional agricultural forecast with real-time market links.</p>
              </div>
            )}
          </section>
        </main>
      </div>
      <ChatBot language={inputs.language} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
