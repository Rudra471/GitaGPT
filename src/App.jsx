import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, Sparkles, Loader2, Quote, Sun, Moon, Info, Heart, Shield, Zap } from 'lucide-react';

const DAILY_QUOTES = [
  { text: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.", ref: "Chapter 2, Verse 47" },
  { text: "The soul can never be cut to pieces by any weapon, nor burned by fire, nor moistened by water, nor withered by the wind.", ref: "Chapter 2, Verse 23" },
  { text: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.", ref: "Chapter 6, Verse 6" },
  { text: "There is neither this world, nor the world beyond, nor happiness for the one who doubts.", ref: "Chapter 4, Verse 40" },
  { text: "A person can rise through the efforts of his own mind; or draw himself down, in the same manner. Because each person is his own friend or enemy.", ref: "Chapter 6, Verse 5" }
];

const generateGitaInsight = async (query) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY; 
  
  if (!apiKey || apiKey === "YOUR_GROQ_API_KEY_HERE") {
    throw new Error("Missing API Key. Please open App.jsx and insert your Groq API Key.");
  }

  const systemPrompt = `
    You are a wise, compassionate spiritual guide embodying the wisdom of the Bhagavad Gita (Lord Krishna).
    The user will present a life problem or doubt.
    Your task is to select the most relevant Shloka from the Bhagavad Gita that addresses this specific problem.

    You must respond in STRICT JSON format. Do not add any conversational text outside the JSON object.
    
    Structure:
    {
      "shloka": "The Sanskrit text of the specific verse",
      "reference": "Chapter X, Verse Y",
      "translation": "The English translation of the verse",
      "wisdom": "A compassionate, deep explanation of how this applies to the user's situation.",
      "actionable_advice": "3 clear, simple, practical steps the user can take today."
    }
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        model: "llama-3.1-8b-instant", 
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No response from Groq.");

    let jsonString = content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark'); // Default to dark mode
  const [dailyQuote, setDailyQuote] = useState(DAILY_QUOTES[0]);
  const resultRef = useRef(null);

  useEffect(() => {
    const existingScript = document.getElementById('tailwindcss-cdn');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'tailwindcss-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    
    const randomQuote = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
    setDailyQuote(randomQuote);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const insight = await generateGitaInsight(query);
      setResult(insight);
    } catch (err) {
      setError(err.message || "Unable to channel the wisdom at this moment.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-stone-950 text-amber-50' : 'bg-orange-50 text-stone-800';
  const cardClass = isDark ? 'bg-stone-900/80 border-stone-800 backdrop-blur-sm' : 'bg-white/80 border-orange-100 backdrop-blur-sm';
  const textMuted = isDark ? 'text-stone-400' : 'text-stone-500';
  const accentText = isDark ? 'text-orange-400' : 'text-orange-600';

  return (
    <div className={`h-screen flex flex-col transition-colors duration-500 ${bgClass} font-sans selection:bg-orange-200 selection:text-orange-900 overflow-hidden relative`}>
      
      {/* Dark Lord Krishna Background Image */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `url('https://www.yousigma.com/images/Bhagavad%20Gita.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isDark ? 0.45 : 0.35, // Min visibility
          filter: 'grayscale(20%) sepia(100%)'
        }}
      />
      
      {/* Gradient Overlay for Readability */}
      <div className={`fixed inset-0 z-0 pointer-events-none ${isDark ? 'bg-gradient-to-b from-stone-950/80 via-stone-950/60 to-black/90' : 'bg-white/60'}`}></div>
      
      {/* Header - Fixed Height */}
      <nav className={`flex-none backdrop-blur-md border-b relative z-20 ${isDark ? 'border-stone-800 bg-stone-950/50' : 'border-orange-200/50 bg-orange-50/50'}`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-orange-100' : 'text-stone-800'}`}>
              Gita<span className="text-orange-500">GPT</span>
            </span>
          </div>
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-stone-800 text-stone-300' : 'hover:bg-orange-100 text-stone-600'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Main Content - Split Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10 h-[calc(100vh-3.5rem)]">
        
        {/* LEFT COLUMN: Hero & Daily Wisdom (Persistent) */}
        <div className="flex flex-col justify-center h-full space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-2.5 bg-orange-100 rounded-full ring-2 ring-orange-50 dark:ring-stone-800 shadow-lg shadow-orange-500/10 w-fit">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-sm leading-tight">
                Ask Anything To <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Krishna</span>
              </h1>
            </div>

            {/* Daily Wisdom - Clean Typography (No Box) */}
            <div className="max-w-xl space-y-4 py-4">
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Daily Wisdom</span>
               <p className={`text-2xl md:text-3xl font-serif italic leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                 "{dailyQuote.text}"
               </p>
               <div className="flex items-center gap-3">
                 <div className="w-12 h-0.5 bg-orange-500/50 rounded-full"></div>
                 <p className="text-sm font-medium text-orange-400/80">{dailyQuote.ref}</p>
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Input & Results */}
        <div className="flex flex-col h-full justify-center overflow-hidden">
          
          {/* Input Form Wrapper */}
          <div className={`w-full transition-all duration-500 flex flex-col ${!result ? 'h-auto' : 'h-auto mb-4'}`}>
            
            {/* Input Form */}
            <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-amber-400/40 via-orange-400/20 to-stone-700/40">
  <div
    className={`relative rounded-2xl overflow-hidden ${cardClass} backdrop-blur-md transition-all duration-300 w-full
    ring-1 ring-amber-400/25`}
  >

    {/* Ambient inner glow */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-black/30" />
    </div>

    <form onSubmit={handleSubmit} className="relative z-10 flex flex-col h-full">

      {/* TEXTAREA */}
      <div className="p-4 flex-grow">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: I feel overwhelmed by my responsibilities..."
          disabled={loading}
          className={`
            w-full ${result ? "h-24" : "h-52"}
            p-5 text-lg resize-none focus:outline-none
            bg-gradient-to-b from-stone-900/60 to-stone-800/40
            placeholder:text-stone-400
            leading-relaxed tracking-wide
            transition-all duration-300
            focus:shadow-inner focus:shadow-amber-500/20
            ${isDark ? "text-stone-100" : "text-stone-900"}
          `}
        />

        {/* Subtext */}
        {!query && (
          <div className="mt-2 text-xs tracking-wide text-amber-400/80">
            Express freely — clarity follows action.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-t
        ${isDark
          ? "border-stone-700/60 bg-stone-900/70"
          : "border-stone-200 bg-stone-50/70"
        }`}
      >
        <div className="flex items-center gap-2 text-[10px] font-medium text-stone-400">
          <Info className="w-3 h-3" />
          <span>Powered by GeetaPress</span>
        </div>

        {/* 🔒 BUTTON UNCHANGED */}
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            !query.trim() || loading
              ? "bg-stone-800 text-stone-600 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white hover:shadow-xl hover:shadow-orange-500/30 active:scale-95"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Asking...</span>
            </>
          ) : (
            <>
              <span>Ask Krishna</span>
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </form>
  </div>
</div>
            {error && (
              <div className="mt-4 px-4 py-2 rounded-lg bg-red-900/20 text-red-400 border border-red-900/50 text-sm animate-in fade-in">
                <span className="font-bold">Error: </span> {error}
              </div>
            )}
          </div>

          {/* Features Grid (Only if NO result) */}
          {!result && (
             <div className="mt-6 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2 hover:-translate-y-1 transition-transform ${cardClass}`}>
                   <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                      <Heart className="w-5 h-5" />
                   </div>
                   <h3 className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Peace</h3>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2 hover:-translate-y-1 transition-transform ${cardClass}`}>
                   <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                      <Zap className="w-5 h-5" />
                   </div>
                   <h3 className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Clarity</h3>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2 hover:-translate-y-1 transition-transform ${cardClass}`}>
                   <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                      <Shield className="w-5 h-5" />
                   </div>
                   <h3 className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Strength</h3>
                </div>
             </div>
          )}

          {/* Results Section (Replaces Features Grid & Occupies space) */}
          {result && (
            <div ref={resultRef} className="flex-1 overflow-y-auto pr-1 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4 h-full">
                <div className={`relative overflow-hidden rounded-xl border p-6 text-center ${cardClass} shadow-lg`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"></div>
                  <Quote className="w-6 h-6 mx-auto text-orange-200 mb-2 opacity-50" />
                  
                  <h2 className={`text-xl md:text-2xl font-serif font-bold mb-2 leading-tight ${accentText}`}>
                    {result.shloka}
                  </h2>
                  
                  <div className="inline-block px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-bold tracking-wider uppercase mb-3">
                    {result.reference}
                  </div>

                  <p className={`text-base italic font-medium leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    "{result.translation}"
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className={`rounded-xl p-4 border ${cardClass} hover:shadow-md transition-shadow`}>
                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      Divine Wisdom
                    </h3>
                    <p className={`text-sm leading-relaxed ${textMuted}`}>
                      {result.wisdom}
                    </p>
                  </div>

                  <div className={`rounded-xl p-4 border ${cardClass} hover:shadow-md transition-shadow`}>
                    <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                      <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      </div>
                      Path of Action
                    </h3>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-stone-950/50' : 'bg-orange-50'}`}>
                      <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
                        {result.actionable_advice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      <footer className={`flex-none py-3 text-center text-xs border-t relative z-20 ${isDark ? 'border-stone-800 bg-stone-950' : 'border-orange-100 bg-orange-50/50'} ${textMuted}`}>
        <p>© 2024 Gita AI Guide. Wisdom for the modern age.</p>
      </footer>

    </div>
  );
}