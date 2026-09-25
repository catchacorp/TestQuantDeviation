import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Zap,
  ShieldAlert,
  Flame,
  Scale,
  Activity,
  BarChart3,
  Bot,
  Radio
} from 'lucide-react';
import { RealTimeSignal } from '../types/financial';
import { GrandmaTooltip } from './GrandmaTooltip';

interface RealTimeSignalsSectionProps {
  signals: RealTimeSignal[];
  onSelectTarget: (ticker: string) => void;
  currentTargetTicker: string;
  theme?: 'dark' | 'light';
  onInspectChart?: (ticker: string) => void;
  onOpenAiMemo?: (ticker: string) => void;
}

export const RealTimeSignalsSection: React.FC<RealTimeSignalsSectionProps> = ({
  signals,
  onSelectTarget,
  currentTargetTicker,
  theme = 'dark',
  onInspectChart,
  onOpenAiMemo
}) => {
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SHORT' | 'ALIGNED'>('ALL');
  const isDark = theme === 'dark';

  // Group signals
  const buySignals = signals.filter(s => s.signalType === 'BUY_LAG');
  const shortSignals = signals.filter(s => s.signalType === 'SHORT_SURGE');
  const alignedSignals = signals.filter(s => s.signalType === 'ALIGNED');

  const filteredSignals = signals.filter(s => {
    if (filter === 'BUY') return s.signalType === 'BUY_LAG';
    if (filter === 'SHORT') return s.signalType === 'SHORT_SURGE';
    if (filter === 'ALIGNED') return s.signalType === 'ALIGNED';
    return true;
  });

  return (
    <section
      id="right-now"
      aria-label="Right Now"
      className={`border rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
      }`}
    >
      {/* Top Banner: Section "Right Now" Title, Live Indicator & Status Counters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/40">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE RADAR</span>
            </span>

            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Right Now
            </h2>

            <span className={`text-xs px-2 py-0.5 rounded font-mono ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}>
              Present-Time Scanner
            </span>

            <GrandmaTooltip title="Z-Score (Deviation Surprise)" theme={theme} />
          </div>

          <p className={`text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time scan across your basket: highlights in present time which stock is currently showing a significant
            <strong className="text-emerald-500"> lag (potential buy) </strong> or
            <strong className="text-rose-500"> surge (potential short sell) </strong> relative to its peer group.
          </p>
        </div>

        {/* Live MCP Status Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono shrink-0 ${
          isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Active Feed:</span>
          <span className="font-bold text-emerald-400">Alpha Vantage MCP</span>
        </div>
      </div>

      {/* Stats Summary Bar & Tactical Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Quick Counts */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Potential Buys:</span>
            <span className="font-mono font-bold text-emerald-400">{buySignals.length}</span>
          </div>

          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>·</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Potential Shorts:</span>
            <span className="font-mono font-bold text-rose-400">{shortSignals.length}</span>
          </div>

          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>·</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>In Line:</span>
            <span className="font-mono font-bold">{alignedSignals.length}</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              filter === 'ALL'
                ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({signals.length})
          </button>
          <button
            onClick={() => setFilter('BUY')}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
              filter === 'BUY'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Potential Buy ({buySignals.length})</span>
          </button>
          <button
            onClick={() => setFilter('SHORT')}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
              filter === 'SHORT'
                ? 'bg-rose-500 text-white font-black shadow-sm'
                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Potential Short ({shortSignals.length})</span>
          </button>
          <button
            onClick={() => setFilter('ALIGNED')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              filter === 'ALIGNED'
                ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            In Line ({alignedSignals.length})
          </button>
        </div>
      </div>

      {/* Actionable Signal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSignals.map(signal => {
          const isSelected = signal.ticker === currentTargetTicker;
          const isBuy = signal.signalType === 'BUY_LAG';
          const isShort = signal.signalType === 'SHORT_SURGE';
          const isAligned = signal.signalType === 'ALIGNED';

          return (
            <div
              key={signal.ticker}
              onClick={() => onSelectTarget(signal.ticker)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3.5 ${
                isSelected
                  ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md scale-[1.01]'
                  : isDark ? 'hover:border-slate-600' : 'hover:border-slate-400'
              } ${
                isBuy
                  ? isDark ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-300'
                  : isShort
                  ? isDark ? 'bg-rose-950/20 border-rose-500/40' : 'bg-rose-50/70 border-rose-300'
                  : isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                {/* Top Row: Ticker & Signal Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-mono font-black ${
                        isBuy ? 'text-emerald-400' : isShort ? 'text-rose-400' : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {signal.ticker}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                          ACTIVE TARGET
                        </span>
                      )}
                    </div>
                    <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {signal.name}
                    </span>
                  </div>

                  {/* Signal Tag */}
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-tight flex items-center gap-1 shadow-xs ${
                    isBuy
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : isShort
                      ? 'bg-rose-500 text-white font-black'
                      : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isBuy && <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />}
                    {isShort && <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />}
                    {signal.signalLabel}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-lg text-xs font-mono my-2.5 ${
                  isDark ? 'bg-slate-950/80 border border-slate-800' : 'bg-white border border-slate-200'
                }`}>
                  <div>
                    <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Price</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${signal.currentPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Peer Fair Value</span>
                    <span className={`text-sm font-bold ${isBuy ? 'text-emerald-400' : isShort ? 'text-rose-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      ${signal.expectedPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Spread vs Peers</span>
                    <span className={`font-bold ${signal.spreadPct >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {signal.spreadPct >= 0 ? '+' : ''}{signal.spreadPct.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Z-Score (Surprise)</span>
                    <span className={`font-bold ${Math.abs(signal.zScore) >= 1.2 ? 'text-amber-400' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {signal.zScore >= 0 ? '+' : ''}{signal.zScore.toFixed(2)}σ
                    </span>
                  </div>
                </div>

                {/* Grandma Plain English Rationale */}
                <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                  isBuy
                    ? isDark ? 'bg-emerald-950/40 text-emerald-200/90' : 'bg-emerald-50 text-emerald-900'
                    : isShort
                    ? isDark ? 'bg-rose-950/40 text-rose-200/90' : 'bg-rose-50 text-rose-900'
                    : isDark ? 'bg-slate-900/60 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="font-bold block text-[11px] mb-0.5">
                    {isBuy ? '💡 Why is this a Potential Buy?' : isShort ? '💡 Why is this a Potential Short Sell?' : '💡 Peer Tracking Status:'}
                  </span>
                  <p>{signal.grandmaRationale}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  vs {signal.peerTickers.join(', ')}
                </span>

                <div className="flex items-center gap-1.5">
                  {onInspectChart && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectChart(signal.ticker);
                      }}
                      className={`text-[11px] font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                        isDark ? 'text-cyan-400 hover:bg-slate-800' : 'text-cyan-700 hover:bg-slate-100'
                      }`}
                      title="Inspect regression spread chart for this equity"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Chart</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTarget(signal.ticker);
                    }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    {isSelected ? 'Active Target ✓' : 'Set as Target →'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

