
import React, { useState, useRef, useEffect } from 'react';
import { askGeminiAboutAdmissions } from '../services/geminiService';
import { School } from '../types';

interface AIAssistantProps {
  schools: School[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ schools }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (response && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  // Utility to strip common Markdown characters to keep the output clean as requested
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '')   // Remove italic/bullets
      .replace(/###/g, '')  // Remove H3
      .replace(/##/g, '')   // Remove H2
      .replace(/#/g, '');   // Remove remaining hashes
  };

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null); 
    
    const context = `
      Current School Database has 100 top HK primary schools including: 
      ${schools.slice(0, 10).map(s => s.name + ' (' + s.nameZh + ')').join(', ')} and many others.
      Topics: Ranking, Application Deadlines, Interview Tips, DSE vs IB track.
      System instruction: Be polite, expert, and use a mix of Chinese and English.
    `;
    
    const result = await askGeminiAboutAdmissions(query, context);
    // Clean the result before setting it to state
    setResponse(result ? cleanMarkdown(result) : "抱歉，目前无法获取回复。");
    setLoading(false);
  };

  const suggestions = [
    "DSE和IB该怎么选？",
    "推荐几所九龙城区的名校",
    "面试需要做哪些准备？",
    "直资学校和私立学校的区别"
  ];

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1 overflow-y-auto mb-6 pr-1 space-y-4 no-scrollbar" ref={scrollRef}>
        {!response && !loading ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                👋 您好！我是您的智能升学顾问。您可以问我关于选校、排名、面试技巧或课程体系的任何问题。
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">您可以这样问：</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => {setQuery(s);}} 
                    className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-xl transition-all border border-slate-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
              </div>
            ) : (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap animate-fadeIn shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">顾问建议</span>
                </div>
                {response}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="relative mt-auto">
        <textarea 
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="在此输入您的升学疑问..."
          className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-medium pr-16"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
        />
        <button 
          onClick={handleAsk}
          disabled={loading || !query.trim()}
          className="absolute right-3 bottom-3 bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-90"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
