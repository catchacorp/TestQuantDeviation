import React, { useState, useMemo } from 'react';
import {
  Plus,
  X,
  Sparkles,
  Search,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { STOCK_PROFILES, DEFAULT_TICKERS } from '../data/defaultStocks';
import { PricePoint, RealTimeSignal } from '../types/financial';
import { GrandmaTooltip } from './GrandmaTooltip';

interface TickerBarProps {
  selectedTickers: string[];
  targetTicker: string;
  onSelectTargetTicker: (ticker: string) => void;
  onAddTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
  onSelectPreset: (tickers: string[]) => void;
  historicalData: Record<string, PricePoint[]>;
  targetPeers?: string[];
  targetSignal?: RealTimeSignal | null;
  theme?: 'dark' | 'light';
}

export const TickerBar: React.FC<TickerBarProps> = ({
  selectedTickers,
  targetTicker,
  onSelectTargetTicker,
  onAddTicker,
  onRemoveTicker,
  onSelectPreset,
  historicalData,
  targetPeers = [],
  targetSignal,
  theme = 'dark'
}) => {
  const [inputValue, setInputValue] = useState('');
  const isDark = theme === 'dark';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim().toUpperCase();
    if (clean && !selectedTickers.includes(clean)) {
      onAddTicker(clean);
      setInputValue('');
    }
  };

  const handleAddSuggested = (ticker: string) => {
    if (!selectedTickers.includes(ticker)) {
      onAddTicker(ticker);
    }
  };

  // Find recommendations based on currently active tickers
  const recommendedPeers = useMemo(() => {
    const set = new Set<string>();
    for (const t of selectedTickers) {
      const prof = STOCK_PROFILES[t];
      if (prof) {
        for (const peer of prof.suggestedPeers) {
          if (!selectedTickers.includes(peer)) {
            set.add(peer);
          }
        }
      }
    }
    return Array.from(set).slice(0, 6);
  }, [selectedTickers]);

  const targetProfile = STOCK_PROFILES[targetTicker];
  const targetSeries = historicalData[targetTicker] || [];
  const targetLastClose = targetSeries[targetSeries.length - 1]?.close;
  const targetPrevClose = targetSeries[targetSeries.length - 2]?.close;
  const targetDailyChangePct =
    targetLastClose != null && targetPrevClose != null
      ? ((targetLastClose - targetPrevClose) / targetPrevClose) * 100
      : null;

  // Basket peers (excluding target ticker for clean separation)
  const peerBasketTickers = selectedTickers.filter(t => t !== targetTicker);

  return (
    <div className={`border-b transition-colors px-4 sm:px-6 lg:px-8 py-4 ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Responsive Grid: Left half (50%) for Target Equity, Right half (50%) for Basket */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
          
          {/* ========================================================================= */}
          {/* LEFT HALF: TARGET EQUITY (BIGGER DISPLAY IN LARGER FONT >= 50% OF ROW)   */}
          {/* ========================================================================= */}
          <div className={`rounded-2xl p-5 sm:p-6 border relative overflow-hidden flex flex-col justify-between transition-all shadow-lg ${
            isDark
              ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 shadow-emerald-950/20'
              : 'bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border-emerald-300 shadow-emerald-100/50'
          }`}>
            {/* Subtle background ambient glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div>
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black font-mono tracking-wider uppercase text-emerald-400">
                    Target Equity · Focal Point
                  </span>
                  <GrandmaTooltip title="Target Equity" theme={theme} />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}>
                    {targetProfile?.exchange || 'NASDAQ'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border hidden sm:inline-block ${
                    isDark ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  }`}>
                    {targetProfile?.sector || 'US Equity'}
                  </span>
                </div>
              </div>

              {/* Main Headline: HUGE Ticker Symbol & Price */}
              <div className="flex flex-wrap items-baseline justify-between gap-4 mt-2">
                <div className="flex items-baseline gap-3">
                  {/* Huge Ticker Font */}
                  <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight drop-shadow-sm ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}>
                    {targetTicker}
                  </h1>

                  <div className="space-y-0.5">
                    <div className={`text-base sm:text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {targetProfile?.name || targetTicker}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {targetProfile?.industry || 'Benchmark Asset'}
                    </div>
                  </div>
                </div>

                {/* Price & Day Movement */}
                {targetLastClose != null && (
                  <div className="text-right">
                    <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      ${targetLastClose.toFixed(2)}
                    </div>
                    {targetDailyChangePct != null && (
                      <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${
                        targetDailyChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {targetDailyChangePct >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {targetDailyChangePct >= 0 ? '+' : ''}
                          {targetDailyChangePct.toFixed(2)}% today
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Target Details: Active Peer Benchmark & Real-Time Status */}
            <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Benchmarked against:
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {targetPeers.length > 0 ? (
                    targetPeers.map(peer => (
                      <button
                        key={peer}
                        onClick={() => onSelectTargetTicker(peer)}
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        }`}
                        title={`Click to switch Target to ${peer}`}
                      >
                        {peer}
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">Active Basket Peers</span>
                  )}
                </div>
              </div>

              {/* Real-time deviation badge for Target */}
              {targetSignal && (
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 shadow-xs ${
                  targetSignal.signalType === 'BUY_LAG'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : targetSignal.signalType === 'SHORT_SURGE'
                    ? 'bg-rose-500 text-white font-black'
                    : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>{targetSignal.signalLabel}</span>
                  <span className="text-[11px] opacity-80">({targetSignal.zScore >= 0 ? '+' : ''}{targetSignal.zScore}σ)</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT HALF: REST OF THE BASKET (TAKING UP HALF OF THE ROW)               */}
          {/* ========================================================================= */}
          <div className={`rounded-2xl p-5 sm:p-6 border flex flex-col justify-between transition-all shadow-md ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              {/* Header with Basket Count, Grandma Tooltip, and Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/40">
                <div className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Basket Peers ({selectedTickers.length} Total)
                  </span>
                  <GrandmaTooltip title="Peer Group (Basket)" theme={theme} />
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Presets:</span>
                  <button
                    onClick={() => onSelectPreset(DEFAULT_TICKERS)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Default 11
                  </button>
                  <button
                    onClick={() => onSelectPreset(['NVDA', 'AMD', 'AVGO', 'MU', 'TSM', 'INTC', 'QCOM', 'ARM'])}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                        : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200'
                    }`}
                  >
                    Semis
                  </button>
                  <button
                    onClick={() => onSelectPreset(['MSFT', 'GOOGL', 'AMZN', 'META', 'AAPL', 'ORCL', 'CRM'])}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-blue-300'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    Cloud
                  </button>
                </div>
              </div>

              {/* Basket Equities Grid: Click any to switch target */}
              <div className="flex flex-wrap items-center gap-2 max-h-36 overflow-y-auto pr-1">
                {selectedTickers.map(ticker => {
                  const isTarget = ticker === targetTicker;
                  const series = historicalData[ticker] || [];
                  const lastClose = series[series.length - 1]?.close;

                  return (
                    <div
                      key={ticker}
                      onClick={() => onSelectTargetTicker(ticker)}
                      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                        isTarget
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 ring-2 ring-emerald-400/50 shadow-md'
                          : isDark
                          ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100 shadow-xs'
                      }`}
                      title={isTarget ? 'Current Target Equity' : `Click to switch Target to ${ticker}`}
                    >
                      <span className="font-mono font-bold text-xs">{ticker}</span>
                      {lastClose != null && (
                        <span className={`font-mono text-[11px] tabular-nums ${
                          isTarget ? 'text-slate-950 font-black' : isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          ${lastClose.toFixed(1)}
                        </span>
                      )}
                      {isTarget && (
                        <span className="text-[9px] font-black px-1 rounded bg-slate-950 text-emerald-400 ml-0.5">
                          ACTIVE
                        </span>
                      )}
                      {selectedTickers.length > 2 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTicker(ticker);
                          }}
                          className={`ml-1 p-0.5 rounded transition-colors ${
                            isTarget ? 'text-slate-900 hover:text-black' : 'text-slate-500 hover:text-rose-400'
                          }`}
                          title={`Remove ${ticker} from basket`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add Ticker Input */}
                <form onSubmit={handleFormSubmit} className="flex items-center">
                  <div className="relative">
                    <Search className={`w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="+ Ticker..."
                      className={`pl-7 pr-6 py-1 rounded-lg text-xs font-mono uppercase focus:outline-none w-28 sm:w-32 transition-colors ${
                        isDark
                          ? 'bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                      }`}
                    />
                    {inputValue && (
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Suggested Comps / Expansion */}
            {recommendedPeers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/40 flex flex-wrap items-center gap-1.5 text-xs">
                <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Suggested:
                </span>
                {recommendedPeers.map(ticker => {
                  const profile = STOCK_PROFILES[ticker];
                  return (
                    <button
                      key={ticker}
                      onClick={() => handleAddSuggested(ticker)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        isDark
                          ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title={`Add ${profile?.name || ticker} to basket`}
                    >
                      <span>+{ticker}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
