
import React, { useState } from 'react';
import { getGeminiQuery } from '../services/geminiService';
import { EventData } from '../types';

interface AIChatProps {
  events: EventData[];
  title?: string;
  subtitle?: string;
  placeholder?: string;
  isEditingText?: boolean;
  onUpdateConfig?: (key: string, value: string) => void;
}

const AIChat: React.FC<AIChatProps> = ({ 
  events, 
  title, 
  subtitle, 
  placeholder,
  isEditingText,
  onUpdateConfig
}) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse('');
    try {
      const result = await getGeminiQuery(query, events);
      setResponse(result);
    } catch (error) {
      setResponse("Failed to connect to AI assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center ultra-float">
          <i className="fa-solid fa-robot text-white"></i>
        </div>
        <div>
          {isEditingText && onUpdateConfig ? (
            <div className="space-y-1">
              <input 
                value={title}
                onChange={(e) => onUpdateConfig('aiTitle', e.target.value)}
                className="block bg-slate-900 border border-indigo-500 text-lg font-bold text-white px-2 py-0.5 rounded"
              />
              <input 
                value={subtitle}
                onChange={(e) => onUpdateConfig('aiSubtitle', e.target.value)}
                className="block bg-slate-900 border border-indigo-500 text-xs text-slate-400 px-2 py-0.5 rounded"
              />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-slate-400 text-xs">{subtitle}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
        {response ? (
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm text-slate-200 leading-relaxed">{response}</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50">
             <i className="fa-solid fa-wand-magic-sparkles text-4xl mb-2"></i>
             <p className="text-sm">Ask about registrations, stats, or participants...</p>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Analyzing database...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleQuery} className="relative">
        {isEditingText && onUpdateConfig ? (
          <input 
            value={placeholder}
            onChange={(e) => onUpdateConfig('aiPlaceholder', e.target.value)}
            className="w-full bg-slate-900 border border-indigo-500 rounded-2xl px-4 py-4 pr-12 text-sm text-indigo-400 font-bold"
            title="Edit Input Placeholder"
          />
        ) : (
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        )}
        <button 
          type="submit"
          disabled={isLoading || isEditingText}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          <i className="fa-solid fa-arrow-up text-xs"></i>
        </button>
      </form>
    </div>
  );
};

export default AIChat;
