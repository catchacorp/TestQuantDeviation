import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Search,
  Filter,
  HelpCircle
} from 'lucide-react';
import { DivergenceEvent } from '../types/financial';
import { STOCK_PROFILES } from '../data/defaultStocks';
import { GrandmaTooltip } from './GrandmaTooltip';

interface DivergenceTableProps {
  events: DivergenceEvent[];
  onSelectEventForAi: (event: DivergenceEvent) => void;
  selectedTickerFilter: string | null;
  onSelectTickerFilter: (ticker: string | null) => void;
  theme?: 'dark' | 'light';
}

export const DivergenceTable: React.FC<DivergenceTableProps> = ({
  events,
  onSelectEventForAi,
  selectedTickerFilter,
  onSelectTickerFilter,
  theme = 'dark'
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'reverted'>('all');
  const isDark = theme === 'dark';

  const filteredEvents = events.filter(e => {
    if (selectedTickerFilter && e.ticker !== selectedTickerFilter) return false;
    if (statusFilter === 'active' && !e.isCurrentlyDeviated) return false;
    if (statusFilter === 'reverted' && e.isCurrentlyDeviated) return false;
    return true;
  });

  return (
    <div className={`border-2 rounded-2xl overflow-hidden shadow-xl transition-colors ${
      isDark ? 'bg-slate-900/90 border-emerald-500/30' : 'bg-white border-emerald-600/30 shadow-slate-100'
    }`}>
      {/* Historical Deviation Delineated Header & Filter Controls */}
      <div className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              HISTORICAL DEVIATION ARCHIVE
            </span>
            <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Historical Deviation
            </h2>
            <GrandmaTooltip title="Divergence Episodes" theme={theme} />
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredEvents.length} Episodes Recorded
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Chronicle of historical dates when an equity deviated from its correlated peer basket, why it broke away, and the exact date it collapsed back to trend.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segmented Control */}
          <div className={`flex items-center p-0.5 border rounded-lg text-xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Episodes
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                statusFilter === 'active'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active ({events.filter(e => e.isCurrentlyDeviated).length})
            </button>
            <button
              onClick={() => setStatusFilter('reverted')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                statusFilter === 'reverted'
                  ? isDark ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm' : 'bg-white text-emerald-700 shadow-sm font-bold'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Reverted ({events.filter(e => !e.isCurrentlyDeviated).length})
            </button>
          </div>

          {/* Clear Ticker Filter Button if set */}
          {selectedTickerFilter && (
            <button
              onClick={() => onSelectTickerFilter(null)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              Filter: <span className="font-mono font-bold text-cyan-400">{selectedTickerFilter}</span> ✕
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className={`divide-y ${isDark ? 'divide-slate-800/70' : 'divide-slate-200'}`}>
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium">No statistical divergence episodes detected under current filters.</p>
            <p className="text-xs mt-1">Try lowering the Z-score threshold or widening the lookback window.</p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const profile = STOCK_PROFILES[event.ticker];
            const isUpward = event.direction === 'UPWARD_OUTPERFORMANCE';

            return (
              <div
                key={event.id}
                className={`p-4 sm:p-5 transition-colors ${
                  event.isCurrentlyDeviated
                    ? isDark ? 'bg-amber-950/10 hover:bg-amber-950/20' : 'bg-amber-50/50 hover:bg-amber-50'
                    : isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                }`}
              >
                {/* Event Primary Row */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Ticker & Group Information */}
                  <div className="flex items-start gap-3.5">
                    <div className={`mt-0.5 p-2 rounded-xl border ${
                      isUpward
                        ? isDark ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : isDark ? 'bg-rose-950/40 border-rose-800/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
                    }`}>
                      {isUpward ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onSelectTickerFilter(event.ticker === selectedTickerFilter ? null : event.ticker)}
                          className={`font-mono text-base font-bold transition-colors ${
                            isDark ? 'text-white hover:text-cyan-400' : 'text-slate-900 hover:text-cyan-700'
                          }`}
                        >
                          {event.ticker}
                        </button>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} hidden sm:inline`}>
                          {profile?.name || event.ticker}
                        </span>

                        <span className="text-slate-400 text-xs">·</span>

                        {/* Status Label */}
                        {event.isCurrentlyDeviated ? (
                          <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Active Deviation
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Reverted to Peers
                          </span>
                        )}

                        <span className="text-slate-400 text-xs">·</span>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {isUpward ? 'Surged Ahead of Peers' : 'Lagged Behind Peers'}
                        </span>
                      </div>

                      {/* Peer Cohort Members */}
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Peer Cohort:</span>
                        <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{event.peerGroupName}</span>
                        <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>({event.peerTickers.join(', ')})</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Timeline Metrics */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    {/* Deviation Dates */}
                    <div className={`border px-3 py-1.5 rounded-lg ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span>Broke Away</span>
                      </div>
                      <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{event.startDate}</div>
                    </div>

                    <div className={`border px-3 py-1.5 rounded-lg ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Peak Deviation
                      </div>
                      <div className="text-amber-500 font-bold">{event.peakDate}</div>
                    </div>

                    <div className={`border px-3 py-1.5 rounded-lg ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-wider flex items-center gap-0.5 ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span>{event.collapseDate ? 'Snapped Back' : 'Current Status'}</span>
                        <GrandmaTooltip title="Mean-Reversion / Collapse" theme={theme} />
                      </div>
                      <div className={event.collapseDate ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                        {event.collapseDate || 'In Progress'}
                      </div>
                    </div>

                    {/* Statistical Magnitude */}
                    <div className={`border px-3 py-1.5 rounded-lg ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-wider flex items-center gap-0.5 ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span>Surprise (Z)</span>
                        <GrandmaTooltip title="Z-Score (Deviation Surprise)" theme={theme} />
                      </div>
                      <div className={`font-bold tabular-nums ${isUpward ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isUpward ? '+' : '-'}{event.maxZScore}σ ({event.peakSpreadPct > 0 ? '+' : ''}{event.peakSpreadPct}%)
                      </div>
                    </div>

                    {/* Duration */}
                    <div className={`border px-3 py-1.5 rounded-lg ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Duration
                      </div>
                      <div className={`font-semibold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Clock className="w-3 h-3 text-slate-400" />
                        {event.durationDays}d
                      </div>
                    </div>

                    {/* AI Research Memo Trigger */}
                    <button
                      onClick={() => onSelectEventForAi(event)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-xs font-sans font-semibold shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Catalyst Memo</span>
                    </button>
                  </div>
                </div>

                {/* Internal and External Rationales */}
                <div className="mt-3.5 pt-3.5 border-t border-slate-800/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Internal Drivers */}
                  <div className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Internal Company Decisions & Earnings Drivers
                    </div>
                    <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {event.internalCatalyst}
                    </p>
                  </div>

                  {/* External Drivers */}
                  <div className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      External World Events & Industry Drivers
                    </div>
                    <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {event.externalCatalyst}
                    </p>
                  </div>
                </div>

                {/* Quantitative Summary */}
                <div className={`mt-2.5 flex items-center justify-between text-xs ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{event.quantSummary}</span>
                  <span className="text-[11px] font-mono">
                    Source: {event.mcpSource}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

