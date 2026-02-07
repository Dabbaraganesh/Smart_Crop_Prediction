import React, { useState, useCallback } from 'react';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import ChatBot from './components/ChatBot';
import { CropInputs, PredictionResult, SupportedLanguage } from './types';
import { getCropRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CropInputs>({
    city: '',
    temperature: '',
    humidity: '',
    rainfall: '',
    ph: '',
    language: 'English'
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationDetected = (city: string, lat: number, lng: number) => {
    setInputs(prev => ({
      ...prev,
      city,
      latitude: lat,
      longitude: lng
    }));
  };

  const fillDemoData = () => {
    setInputs(prev => ({
      ...prev,
      city: 'Nashik, Maharashtra',
      temperature: '28.5',
      humidity: '75',
      rainfall: '1100',
      ph: '6.4'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const recommendation = await getCropRecommendation(inputs);
      setResult(recommendation);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 md:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation / Header */}
        <header className="text-center mb-12 md:mb-20 no-print">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[2rem] mb-8 shadow-xl border border-slate-100 transform -rotate-6">
            <i className="fa-solid fa-wheat-awn text-5xl text-emerald-600"></i>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-6 leading-none">
            BHARAT <span className="text-emerald-600">AGRI-AI</span>
          </h1>
          <p className="text-base md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-widest opacity-80">
            Intelligent Crop Advisor <span className="mx-3 text-slate-300">|</span> Market-Linked ₹ Data
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left Column: Input Panel */}
          <section className="lg:col-span-5 bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 relative no-print overflow-hidden">
            {/* Visual Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-50"></div>
            
            <div className="absolute top-0 right-0 p-6 z-10">
              <button 
                onClick={fillDemoData} 
                className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-emerald-200 transition-all"
              >
                Auto-Fill
              </button>
            </div>
            
            <div className="mb-12 relative">
              <h2 className="text-3xl font-black text-slate-900">Farm Input</h2>
              <div className="w-12 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-3">Precision Soil & Weather Analysis</p>
            </div>
            
            <InputSection 
              inputs={inputs} 
              onChange={handleInputChange} 
              onSubmit={handleSubmit} 
              isLoading={isLoading} 
              onLocationDetected={handleLocationDetected}
            />
          </section>

          {/* Right Column: Output / Reports */}
          <section className="lg:col-span-7 space-y-8 min-h-[500px]">
            {isLoading ? (
              <div className="bg-white p-16 rounded-[3rem] shadow-xl flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 min-h-[500px] text-center">
                <div className="relative mb-10">
                    <div className="w-24 h-24 border-8 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fa-solid fa-satellite-dish text-2xl text-emerald-600"></i>
                    </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Syncing Local Markets...</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching current Mandi prices for {inputs.city || 'your region'} in {inputs.language}</p>
              </div>
            ) : result ? (
              <ResultCard result={result} inputs={inputs} />
            ) : error ? (
              <div className="bg-red-50 p-12 rounded-[3rem] text-center border-2 border-red-100 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-triangle-exclamation text-red-600 text-3xl"></i>
                </div>
                <h4 className="text-2xl font-black text-red-900 mb-2">Network Error</h4>
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <button onClick={handleSubmit} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all">Try Again</button>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center text-center min-h-[500px] justify-center no-print group">
                <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-10 shadow-inner group-hover:bg-emerald-50 group-hover:text-emerald-100 transition-all duration-700">
                  <i className="fa-solid fa-map-location-dot text-6xl"></i>
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Localized Intelligence</h3>
                <p className="text-slate-500 font-medium max-w-md leading-relaxed">
                  Enter your <strong className="text-slate-800">City or District</strong> and soil metrics to generate a localized report with real-time Indian Mandi rates.
                </p>
                
                <div className="mt-12 flex flex-wrap justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                        <i className="fa-solid fa-location-arrow text-emerald-600"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Pinpoint</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                        <i className="fa-solid fa-bolt text-amber-500"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Real-time</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                        <i className="fa-solid fa-language text-blue-500"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Multi-lang</span>
                    </div>
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] no-print gap-8">
          <p>© {new Date().getFullYear()} BHARAT AGRI-AI SYSTEM • PAN-INDIA COVERAGE</p>
          <div className="flex gap-10">
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> All Districts Covered</span>
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Mandi Data Online</span>
          </div>
        </footer>
      </div>
      <ChatBot language={inputs.language} />
    </div>
  );
};

export default App;