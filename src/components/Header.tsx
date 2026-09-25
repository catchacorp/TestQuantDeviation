import React from 'react';
import {
  Activity,
  Server,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  Heart,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { GrandmaTooltip } from './GrandmaTooltip';

interface HeaderProps {
  lookbackDays: number;
  setLookbackDays: (days: number) => void;
  zThreshold: number;
  setZThreshold: (z: number) => void;
  onOpenMcpModal: () => void;
  onRefreshData: () => void;
  isLoading: boolean;
  activeDivergenceCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  targetTicker: string;
}

export const Header: React.FC<HeaderProps> = ({
  lookbackDays,
  setLookbackDays,
  zThreshold,
  setZThreshold,
  onOpenMcpModal,
  onRefreshData,
  isLoading,
  activeDivergenceCount,
  theme,
  onToggleTheme,
  targetTicker
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`border-b sticky top-0 z-30 transition-colors backdrop-blur-md ${
      isDark ? 'bg-slate-950/85 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                AlphaPairs Quant
              </h1>

              {/* Clickable MCP Badge with Live Status & Health */}
              <button
                onClick={onOpenMcpModal}
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border transition-all flex items-center gap-1.5 hover:scale-105 ${
                  isDark
                    ? 'bg-emerald-950/70 border-emerald-700/50 text-emerald-400 hover:border-emerald-500'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:border-emerald-500'
                }`}
                title="Click to view Model Context Protocol (MCP) server health and live wire frames"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Yahoo Finance MCP · 38ms</span>
                <span className="text-[10px] text-emerald-600 font-sans">▾</span>
              </button>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Econometric Peer Deviation & Statistical Arbitrage Engine
            </p>
          </div>
        </div>

        {/* Clustered Controls Group to prevent visual crowdedness */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Active Deviations Badge */}
          <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${activeDivergenceCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Deviating:</span>
            <span className={`font-mono font-bold ${activeDivergenceCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {activeDivergenceCount} {activeDivergenceCount === 1 ? 'Stock' : 'Stocks'}
            </span>
            <GrandmaTooltip title="Z-Score (Deviation Surprise)" theme={theme} />
          </div>

          {/* CLUSTERED QUANT SETTINGS PILL */}
          <div className={`flex items-center p-1 rounded-xl border text-xs divide-x ${
            isDark
              ? 'bg-slate-900 border-slate-800 divide-slate-800'
              : 'bg-slate-100 border-slate-200 divide-slate-200'
          }`}>
            {/* Section 1: Lookback */}
            <div className="flex items-center gap-1 pr-2 pl-1">
              <span className={`text-[11px] font-medium flex items-center gap-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span>Window:</span>
              </span>
              {[
                { label: '90D', days: 90 },
                { label: '180D', days: 180 },
                { label: '1Y', days: 252 },
                { label: '2Y', days: 504 }
              ].map(item => (
                <button
                  key={item.days}
                  onClick={() => setLookbackDays(item.days)}
                  className={`px-1.5 py-0.5 text-xs font-mono rounded transition-colors ${
                    lookbackDays === item.days
                      ? isDark
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-white text-slate-900 shadow-sm font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Section 2: Z-Threshold */}
            <div className="flex items-center gap-1 px-2">
              <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Alert:</span>
              </span>
              {[
                { label: '1.5σ', value: 1.5 },
                { label: '2.0σ', value: 2.0 },
                { label: '2.5σ', value: 2.5 }
              ].map(item => (
                <button
                  key={item.value}
                  onClick={() => setZThreshold(item.value)}
                  className={`px-1.5 py-0.5 text-xs font-mono rounded transition-colors ${
                    zThreshold === item.value
                      ? isDark
                        ? 'bg-slate-800 text-emerald-400 font-bold'
                        : 'bg-white text-emerald-700 shadow-sm font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <GrandmaTooltip title="Z-Score (Deviation Surprise)" theme={theme} />
            </div>

            {/* Section 3: Theme Toggle (Dark / Light) */}
            <div className="pl-2 pr-1 flex items-center">
              <button
                onClick={onToggleTheme}
                className={`p-1 rounded-md transition-colors ${
                  isDark
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-white shadow-sm'
                }`}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={onRefreshData}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};

