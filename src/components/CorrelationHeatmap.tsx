import React, { useState } from 'react';
import { CorrelationMatrix, ClusterGroup } from '../types/financial';
import { Layers, Network, Zap, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import { STOCK_PROFILES } from '../data/defaultStocks';
import { GrandmaTooltip } from './GrandmaTooltip';

interface CorrelationHeatmapProps {
  correlationMatrix: CorrelationMatrix;
  clusters: ClusterGroup[];
  onSelectPair: (tickerA: string, tickerB: string) => void;
  onFilterByCluster: (tickers: string[]) => void;
  theme?: 'dark' | 'light';
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  correlationMatrix,
  clusters,
  onSelectPair,
  onFilterByCluster,
  theme = 'dark'
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);
  const isDark = theme === 'dark';

  const { tickers, matrix } = correlationMatrix;

  // Color generator for Pearson correlation coefficient (-1.0 to +1.0)
  const getCellColor = (val: number) => {
    if (val === 1) return isDark ? 'bg-emerald-500/25 text-emerald-300 font-bold' : 'bg-emerald-100 text-emerald-900 font-bold';
    if (val >= 0.75) return isDark ? 'bg-emerald-600/35 text-emerald-300 font-semibold' : 'bg-emerald-200/70 text-emerald-900 font-bold';
    if (val >= 0.60) return isDark ? 'bg-emerald-700/25 text-emerald-400' : 'bg-emerald-100/60 text-emerald-800 font-semibold';
    if (val >= 0.45) return isDark ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-100/60 text-cyan-800';
    if (val >= 0.30) return isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700';
    if (val >= 0) return isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-500';
    return isDark ? 'bg-rose-950/40 text-rose-300' : 'bg-rose-100 text-rose-800';
  };

  return (
    <div className="space-y-6">
      {/* Peer Clusters Overview */}
      <div className={`border rounded-xl p-4 sm:p-5 shadow-xl transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className={`text-base font-semibold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Network className="w-4 h-4 text-emerald-400" />
              <span>Identified Peer Correlation Clusters</span>
              <GrandmaTooltip title="Peer Group" theme={theme} />
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Equities grouped by mathematical log-return co-movement and shared business models
            </p>
          </div>
          <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Lookback: {correlationMatrix.lookbackDays} Trading Days
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {clusters.map((cluster, idx) => (
            <div
              key={cluster.id}
              className={`border rounded-xl p-3.5 flex flex-col justify-between transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-cyan-400' : idx === 1 ? 'bg-blue-400' : 'bg-purple-400'}`} />
                    {cluster.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    avg ρ: {cluster.averageCorrelation}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {cluster.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {cluster.tickers.map(t => (
                    <span
                      key={t}
                      className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onFilterByCluster(cluster.tickers)}
                  className={`w-full text-xs font-medium py-1.5 rounded border transition-colors ${
                    isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Analyze Cluster Divergence
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Pearson Correlation Matrix */}
      <div className={`border rounded-xl p-4 sm:p-5 shadow-xl overflow-x-auto transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className={`text-base font-semibold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Pairwise Pearson Correlation Matrix (Log Returns)</span>
              <GrandmaTooltip title="Correlation (ρ)" theme={theme} />
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click any cell to inspect cointegration, historical spread ratio, and divergence
            </p>
          </div>

          {/* Hover inspector badge */}
          {hoveredCell && (
            <div className={`text-xs font-mono border px-3 py-1 rounded ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <span className="font-bold text-cyan-500">{tickers[hoveredCell.i]}</span>
              {' ↔ '}
              <span className="font-bold text-cyan-500">{tickers[hoveredCell.j]}</span>
              {': '}
              <span className="text-emerald-500 font-bold">ρ = {matrix[hoveredCell.i][hoveredCell.j]}</span>
            </div>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="inline-block min-w-full">
          <table className="border-collapse text-xs font-mono select-none">
            <thead>
              <tr>
                <th className={`p-2 text-left font-sans text-[11px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ticker</th>
                {tickers.map(t => (
                  <th key={t} className={`p-2 text-center font-bold w-12 min-w-[48px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickers.map((tRow, i) => (
                <tr key={tRow} className={`border-t ${isDark ? 'border-slate-800/40' : 'border-slate-200'}`}>
                  <td className={`p-2 text-left font-bold whitespace-nowrap pr-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                    {tRow}
                  </td>
                  {tickers.map((tCol, j) => {
                    const corr = matrix[i][j];
                    const isSelf = i === j;

                    return (
                      <td
                        key={tCol}
                        onClick={() => !isSelf && onSelectPair(tRow, tCol)}
                        onMouseEnter={() => setHoveredCell({ i, j })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`p-2 text-center cursor-pointer transition-all border ${isDark ? 'border-slate-950/50' : 'border-white'} ${getCellColor(
                          corr
                        )} ${!isSelf ? 'hover:scale-105 hover:z-10 hover:ring-2 hover:ring-emerald-400' : 'opacity-80'}`}
                        title={`${tRow} vs ${tCol}: Pearson r = ${corr}`}
                      >
                        {corr.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend */}
        <div className={`flex flex-wrap items-center justify-between text-xs mt-4 pt-3 border-t ${
          isDark ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">Correlation Scale:</span>
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500" /> Negative
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <span className="w-3 h-3 rounded bg-slate-400/20 border border-slate-400" /> Weak (0.3)
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500" /> Moderate (0.5)
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" /> Strong (&gt;0.75)
            </span>
          </div>
          <span className="text-[11px]">A score above 0.70 confirms two stocks are strong walking buddies</span>
        </div>
      </div>
    </div>
  );
};

