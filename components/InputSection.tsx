import React from 'react';
import { CropInputs, SupportedLanguage } from '../types';

interface InputSectionProps {
  inputs: CropInputs;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ inputs, onChange, onSubmit, isLoading }) => {
  const languageOptions: { value: SupportedLanguage; label: string }[] = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Marathi', label: 'Marathi (मराठी)' },
    { value: 'Bengali', label: 'Bengali (বাংলা)' },
    { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
    { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { value: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
    { value: 'Odia', label: 'Odia (ଓଡ଼ିଆ)' },
    { value: 'Assamese', label: 'Assamese (অসমীয়া)' },
  ];

  const fields = [
    { label: 'Temperature (°C)', name: 'temperature', icon: 'fa-temperature-high', color: 'text-orange-500', placeholder: 'e.g. 28', hint: 'North: 10-45°C' },
    { label: 'Humidity (%)', name: 'humidity', icon: 'fa-droplet', color: 'text-blue-500', placeholder: 'e.g. 70', hint: 'Coastal: 60%+' },
    { label: 'Rainfall (mm)', name: 'rainfall', icon: 'fa-cloud-showers-heavy', color: 'text-indigo-500', placeholder: 'e.g. 1000', hint: 'Monsoon data' },
    { label: 'Soil pH', name: 'ph', icon: 'fa-flask', color: 'text-purple-500', placeholder: 'e.g. 6.5', hint: 'Standard: 6-7.5' },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center">
            <i className="fa-solid fa-language mr-2 text-green-600"></i>
            Preferred Language / भाषा
          </label>
          <div className="relative">
            <select
              name="language"
              value={inputs.language}
              onChange={onChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-green-500 outline-none shadow-sm appearance-none cursor-pointer pr-10"
            >
              {languageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center">
            <i className="fa-solid fa-location-dot mr-2 text-red-500"></i>
            City / District (All India)
          </label>
          <input
            type="text"
            name="city"
            value={inputs.city}
            onChange={onChange}
            placeholder="e.g. Nagpur, Nashik, Guntur..."
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-green-500 transition-all outline-none shadow-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-700 flex items-center uppercase tracking-wider">
                <i className={`fa-solid ${field.icon} mr-1.5 ${field.color}`}></i>
                {field.label}
              </label>
              <span className="text-[10px] text-gray-400 font-medium">{field.hint}</span>
            </div>
            <input
              type="number"
              step="0.01"
              name={field.name}
              value={inputs[field.name as keyof CropInputs] as string}
              onChange={onChange}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-slate-900 font-bold text-lg focus:border-green-500 transition-all outline-none shadow-sm"
              required
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-4 px-6 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-3 ${
          isLoading ? 'bg-slate-300 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97]'
        }`}
      >
        {isLoading ? (
          <><i className="fa-solid fa-sync animate-spin"></i><span>Analyzing Local Market...</span></>
        ) : (
          <><i className="fa-solid fa-indian-rupee-sign"></i><span>Check Market Potential</span></>
        )}
      </button>
    </form>
  );
};

export default InputSection;