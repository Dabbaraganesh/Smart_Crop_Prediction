
import React, { useState, useRef, useEffect } from 'react';
import { createAgriculturalChat } from '../services/geminiService';
import { ChatMessage, SupportedLanguage } from '../types';

interface ChatBotProps {
  language: SupportedLanguage;
}

const ChatBot: React.FC<ChatBotProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dynamic greetings map to ensure the bot starts in the right language
  const greetings: Record<SupportedLanguage, string> = {
    English: "Namaste! I am Bharat Agri-AI Pro. I'm trained with Deep Reasoning and Search Grounding to assist you. Ask me about complex soil health, crop diseases, or Mandi rates.",
    Hindi: "नमस्ते! मैं भारत एग्री-एआई प्रो हूं। मैं आपकी सहायता के लिए गहन तर्क और खोज ग्राउंडिंग के साथ प्रशिक्षित हूं। मुझसे मिट्टी के स्वास्थ्य, फसल रोगों या मंडी दरों के बारे में पूछें।",
    Telugu: "నమస్తే! నేను భారత్ అగ్రి-AI ప్రో. మీకు సహాయం చేయడానికి నేను లోతైన తార్కికత మరియు సెర్చ్ గ్రౌండింగ్‌తో శిక్షణ పొందాను. నేల ఆరోగ్యం, పంట వ్యాధులు లేదా మండి ధరల గురించి నన్ను అడగండి.",
    Tamil: "வணக்கம்! நான் பாரத் அக்ரி-AI புரோ. உங்களுக்கு உதவ ஆழ்ந்த தர்க்கம் மற்றும் தேடல் கிரவுண்டிங்குடன் நான் பயிற்சி பெற்றுள்ளேன். மண் ஆரோக்கியம், பயிர் நோய்கள் அல்லது மண்டி விலைகள் பற்றி என்னிடம் கேளுங்கள்.",
    Kannada: "ನಮಸ್ತೆ! ನಾನು ಭಾರತ್ ಅಗ್ರಿ-AI ಪ್ರೊ. ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಆಳವಾದ ತರ್ಕ ಮತ್ತು ಸರ್ಚ್ ಗ್ರೌಂಡಿಂಗ್‌ನೊಂದಿಗೆ ತರಬೇತಿ ಪಡೆದಿದ್ದೇನೆ. ಮಣ್ಣಿನ ಆರೋಗ್ಯ, ಬೆಳೆ ರೋಗಗಳು ಅಥವಾ ಮಂಡಿ ದರಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.",
    Marathi: "नमस्ते! मी भारत ॲग्री-एआय प्रो आहे. तुम्हाला मदत करण्यासाठी मी सखोल तर्क आणि शोध ग्राउंडिंगसह प्रशिक्षित आहे. मला जमिनीचे आरोग्य, पिकांचे रोग किंवा मंडी दरांबद्दल विचारा.",
    Bengali: "নমস্কার! আমি ভারত এগ্রি-এআই প্রো। আপনাকে সাহায্য করার জন্য আমি গভীর যুক্তি এবং অনুসন্ধান গ্রাউন্ডিংয়ের সাথে প্রশিক্ষিত। আমাকে মাটির স্বাস্থ্য, ফসলের রোগ বা মন্ডির দাম সম্পর্কে জিজ্ঞাসা করুন।",
    Malayalam: "നമസ്തേ! ഞാൻ ഭാരത് അഗ്രി-AI പ്രോ ആണ്. നിങ്ങളെ സഹായിക്കുന്നതിനായി ആഴത്തിലുള്ള യുക്തിയും സെർച്ച് ഗ്രൗണ്ടിംഗും ഉപയോഗിച്ച് ഞാൻ പരിശീലിപ്പിക്കപ്പെട്ടിരിക്കുന്നു. മണ്ണിന്റെ ആരോഗ്യം, വിള രോഗങ്ങൾ അല്ലെങ്കിൽ മണ്ടി നിരക്കുകൾ എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കുക.",
    Punjabi: "ਨਮਸਤੇ! ਮੈਂ ਭਾਰਤ ਐਗਰੀ-ਏਆਈ ਪ੍ਰੋ ਹਾਂ। ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਮੈਨੂੰ ਡੂੰਘੇ ਤਰਕ ਅਤੇ ਖੋਜ ਗਰਾਉਂਡਿੰਗ ਨਾਲ ਸਿਖਲਾਈ ਦਿੱਤੀ ਗਈ ਹੈ। ਮੈਨੂੰ ਮਿੱਟੀ ਦੀ ਸਿਹਤ, ਫਸਲਾਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਜਾਂ ਮੰਡੀ ਦੀਆਂ ਦਰਾਂ ਬਾਰੇ ਪੁੱਛੋ।",
    Gujarati: "નમસ્તે! હું ભારત એગ્રી-AI પ્રો છું. તમારી સહાય માટે મને ઊંડા તર્ક અને સર્ચ ગ્રાઉન્ડિંગ સાથે તાલીમ આપવામાં આવી છે. મને જમીનનું સ્વાસ્થ્ય, પાકના રોગો અથવા મંડીના દરો વિશે પૂછો.",
    Odia: "ନମସ୍କାର! ମୁଁ ଭାରତ ଅଗ୍ରି-AI ପ୍ରୋ | ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବା ପାଇଁ ମୋତେ ଗଭୀର ଯୁକ୍ତି ଏବଂ ସର୍ଚ୍ଚ ଗ୍ରାଉଣ୍ଡିଂ ସହିତ ପ୍ରଶିକ୍ଷିତ କରାଯାଇଛି | ମାଟିର ସ୍ୱାସ୍ଥ୍ୟ, ଶସ୍ୟ ରୋଗ କିମ୍ବା ମଣ୍ଡି ଦର ବିଷୟରେ ମୋତେ ପଚାରନ୍ତୁ |",
    Assamese: "নমস্কাৰ! মই ভাৰত এগ্রি-AI প্রো। আপোনাক সহায় কৰিবলৈ মোক গভীৰ যুক্তি আৰু চাৰ্চ গ্রাউণ্ডিংৰ সৈতে প্রশিক্ষণ দিয়া হৈছে। মাটিৰ স্বাস্থ্য, শস্যৰ ৰোগ বা মান্ডিৰ দৰ সম্পর্কে মোক সোধক।"
  };

  useEffect(() => {
    chatRef.current = createAgriculturalChat(language);
    setMessages([{ 
      role: 'model', 
      text: greetings[language] || greetings['English']
    }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I've analyzed your query but could not generate a response." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Service temporarily unavailable. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] md:w-[500px] h-[650px] max-h-[85vh] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/40">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div>
                <span className="font-black block text-sm tracking-widest uppercase">Bharat AI Pro</span>
                <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                   Thinking Mode Active
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none font-medium'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                      {line.includes('**') ? 
                        line.split(/(\*\*.*?\*\*)/g).map((part, j) => 
                          part.startsWith('**') ? <strong key={j} className="text-emerald-700 font-bold">{part.slice(2, -2)}</strong> : part
                        ) : line
                      }
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing with Thinking Budget...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything in ${language}...`}
              className="flex-1 text-sm bg-slate-100 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane text-xl"></i>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-3 transition-all relative group"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-headset'} text-2xl`}></i>
        {!isOpen && (
          <span className="absolute -top-3 -right-3 bg-red-600 text-[9px] font-black px-2 py-1 rounded-full uppercase border-2 border-white shadow-lg animate-pulse">
            Agri Pro
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
