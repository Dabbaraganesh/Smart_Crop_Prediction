import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';

// --- Types ---
type Language = 'English' | 'Hindi' | 'Telugu' | 'Tamil' | 'Marathi' | 'Bengali' | 'Kannada';

interface PredictionResult {
  crop: string;
  rationale: string;
  marketOutlook: string;
  mandiPrice: string;
}

const App = () => {
  const [inputs, setInputs] = useState({
    city: '',
    temp: '28',
    humidity: '70',
    rain: '1000',
    ph: '6.5',
    lang: 'English' as Language
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an Indian Agriculture Expert. 
      Inputs: City: ${inputs.city}, Temp: ${inputs.temp}°C, Humidity: ${inputs.humidity}%, Rain: ${inputs.rain}mm, pH: ${inputs.ph}. 
      Language: ${inputs.lang}.
      Provide a crop recommendation in JSON format with exactly these keys: 
      crop (name of crop in ${inputs.lang}), rationale (why this crop), marketOutlook (potential profit), mandiPrice (estimated current price range in ₹). 
      IMPORTANT: Respond ONLY with a valid JSON object.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      const data = JSON.parse(text);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 emerald-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
            <i className="fa-solid fa-wheat-awn text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">BHARAT <span className="text-emerald-600">AGRI-AI</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precision Farming Advisor</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AI Engine Online
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <i className="fa-solid fa-sliders text-emerald-600"></i> Field Parameters
            </h3>
            <form onSubmit={runAnalysis} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Language Selection</label>
                <select 
                  value={inputs.lang} 
                  onChange={e => setInputs({...inputs, lang: e.target.value as Language})}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                >
                  {['English', 'Hindi', 'Telugu', 'Tamil', 'Marathi', 'Bengali', 'Kannada'].map(l => (
                    <option key={l} value={l} className="text-slate-900">{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">District / City</label>
                <input 
                  type="text" 
                  value={inputs.city}
                  onChange={e => setInputs({...inputs, city: e.target.value})}
                  placeholder="Enter location"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 shadow-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'temp', label: 'Temp (°C)', type: 'number' },
                  { key: 'humidity', label: 'Humidity (%)', type: 'number' },
                  { key: 'rain', label: 'Rain (mm)', type: 'number' },
                  { key: 'ph', label: 'Soil pH', type: 'number' }
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">{f.label}</label>
                    <input 
                      type={f.type} 
                      step="0.1"
                      value={inputs[f.key as keyof typeof inputs]}
                      onChange={e => setInputs({...inputs, [f.key]: e.target.value})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      required
                    />
                  </div>
                ))}
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 emerald-gradient text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:hover:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner animate-spin"></i> Analyzing...
                  </span>
                ) : 'Generate Prediction'}
              </button>
            </form>
          </section>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="animate-fade-in space-y-6">
              <div id="report-card" className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden pb-12">
                <div className="h-3 w-full emerald-gradient"></div>
                <div className="p-8 md:p-12 space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Recommended Cultivation</p>
                      <h2 className="royal-serif text-5xl md:text-7xl font-black text-slate-900 leading-none">{result.crop}</h2>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Market Rating</p>
                      <div className="flex gap-1 text-emerald-500">
                        {[1, 2, 3, 4, 5].map(i => <i key={i} className="fa-solid fa-star text-sm"></i>)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-microscope text-emerald-600"></i> Scientific Rationale
                      </h4>
                      <p className="text-slate-600 leading-relaxed font-medium text-lg italic royal-serif">"{result.rationale}"</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-indian-rupee-sign text-emerald-600"></i> Economic Outlook
                      </h4>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                        <p className="text-slate-900 font-bold mb-3">{result.marketOutlook}</p>
                        <div className="text-emerald-700 font-black text-2xl flex items-center gap-2">
                           <i className="fa-solid fa-tags text-sm opacity-50"></i> {result.mandiPrice}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Verified Local Mandi Rates</p>
                      </div>
                    </div>
                  </div>

                  <footer className="pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Generated by Bharat Agri-AI v3.0</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </footer>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[450px] border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/50">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <i className="fa-solid fa-seedling text-5xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ready for Precision Analysis</h3>
              <p className="text-slate-400 text-sm max-w-sm mt-3 font-medium leading-relaxed">
                Enter your field parameters on the left to receive a comprehensive AI-driven agricultural report tailored to your region.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);