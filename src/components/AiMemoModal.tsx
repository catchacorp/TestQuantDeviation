import React, { useState, useEffect } from 'react';
import { DivergenceEvent } from '../types/financial';
import { X, Sparkles, Copy, Check, TrendingUp, TrendingDown, Clock, Download, FileSpreadsheet } from 'lucide-react';
import { mcpService } from '../services/mcpFinancialService';
import { STOCK_PROFILES } from '../data/defaultStocks';

interface AiMemoModalProps {
  event: DivergenceEvent | null;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const AiMemoModal: React.FC<AiMemoModalProps> = ({ event, onClose, theme = 'dark' }) => {
  const [memoContent, setMemoContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!event) return;

    let isMounted = true;
    setIsLoading(true);

    mcpService.requestAiCatalystDeepDive(event).then(res => {
      if (isMounted) {
        setMemoContent(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [event]);

  if (!event) return null;

  const profile = STOCK_PROFILES[event.ticker];
  const isUpward = event.direction === 'UPWARD_OUTPERFORMANCE';

  const handleCopy = () => {
    navigator.clipboard.writeText(memoContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className={`border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isUpward
                ? isDark ? 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : isDark ? 'bg-rose-950/50 border-rose-800/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}>
              {isUpward ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Quantitative Catalyst Research Brief
                </h2>
                <span className="text-xs font-mono font-bold text-cyan-500 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {event.ticker} vs {event.peerGroupName}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                AI Synthesis grounded in authentic historical market milestones and Model Context Protocol data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Quick Snapshot Banner */}
        <div className={`px-4 sm:px-6 py-3 border-b grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono ${
          isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div>
            <span className={`text-[10px] uppercase block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Start Date</span>
            <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{event.startDate}</span>
          </div>
          <div>
            <span className={`text-[10px] uppercase block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Peak Deviation Date</span>
            <span className="text-amber-500 font-bold">{event.peakDate}</span>
          </div>
          <div>
            <span className={`text-[10px] uppercase block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reversion / Collapse Date</span>
            <span className={event.collapseDate ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
              {event.collapseDate || 'Active Decoupling'}
            </span>
          </div>
          <div>
            <span className={`text-[10px] uppercase block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Peak Z-Score</span>
            <span className={`font-bold ${isUpward ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isUpward ? '+' : '-'}{event.maxZScore}σ ({event.peakSpreadPct > 0 ? '+' : ''}{event.peakSpreadPct}%)
            </span>
          </div>
        </div>

        {/* Memo Content Body */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 text-xs space-y-4 leading-relaxed font-sans ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Querying Gemini 3.8 Flash & Synthesizing Institutional Catalyst Report...
              </p>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Extracting 10-Q/8-K earnings transcripts and macroeconomic context
              </p>
            </div>
          ) : (
            <div className="prose prose-xs max-w-none space-y-3">
              <div className={`whitespace-pre-wrap font-sans leading-relaxed p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {memoContent}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Engine: Gemini 3.8 Flash · Evaluated over {event.durationDays} trading days
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Memo'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
