import React, { useState, useMemo } from 'react';
import { PricePoint } from '../types/financial';
import { ArrowLeftRight, TrendingUp, TrendingDown, Clock, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { calculateLogReturns, calculatePearsonCorrelation, calculateSMA } from '../services/quantEngine';
import { STOCK_PROFILES } from '../data/defaultStocks';
import { GrandmaTooltip } from './GrandmaTooltip';

interface PairInspectorProps {
  tickerA: string;
  tickerB: string;
  onChangeTickerA: (ticker: string) => void;
  onChangeTickerB: (ticker: string) => void;
  availableTickers: string[];
  historicalData: Record<string, PricePoint[]>;
  zThreshold: number;
  theme?: 'dark' | 'light';
}

export const PairInspector: React.FC<PairInspectorProps> = ({
  tickerA,
  tickerB,
  onChangeTickerA,
  onChangeTickerB,
  availableTickers,
  historicalData,
  zThreshold,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const seriesA = historicalData[tickerA] || [];
  const seriesB = historicalData[tickerB] || [];

  // Align dates and compute price ratio spread: Ratio_t = PriceA_t / PriceB_t
  const pairData = useMemo(() => {
    const minLen = Math.min(seriesA.length, seriesB.length);
    if (minLen === 0) return [];

    const data = [];
    const ratios: number[] = [];

    for (let i = 0; i < minLen; i++) {
      const pA = seriesA[i].close;
      const pB = seriesB[i].close;
      const ratio = pB > 0 ? pA / pB : 1;
      ratios.push(ratio);
    }

    // 20 and 50 period SMA of spread ratio
    const sma20 = calculateSMA(ratios, 20);
    const sma50 = calculateSMA(ratios, 50);

    // Compute rolling 30-day z-score of spread ratio
    for (let i = 0; i < minLen; i++) {
      const start = Math.max(0, i - 30);
      const slice = ratios.slice(start, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
      const std = Math.sqrt(variance) || 1e-4;
      const z = (ratios[i] - mean) / std;

      data.push({
        date: seriesA[i].date,
        timestamp: seriesA[i].timestamp,
        priceA: seriesA[i].close,
        priceB: seriesB[i].close,
        ratio: Number(ratios[i].toFixed(4)),
        sma20: sma20[i] ? Number(sma20[i]!.toFixed(4)) : null,
        sma50: sma50[i] ? Number(sma50[i]!.toFixed(4)) : null,
        mean: Number(mean.toFixed(4)),
        std: Number(std.toFixed(4)),
        zScore: Number(z.toFixed(2)),
        isDivergent: Math.abs(z) >= zThreshold
      });
    }

    return data;
  }, [seriesA, seriesB, zThreshold]);

  // Pearson correlation of log returns
  const correlation = useMemo(() => {
    const logA = calculateLogReturns(seriesA.map(p => p.close));
    const logB = calculateLogReturns(seriesB.map(p => p.close));
    return calculatePearsonCorrelation(logA, logB);
  }, [seriesA, seriesB]);

  const latestPoint = pairData[pairData.length - 1];

  // SVG dimensions
  const svgWidth = 850;
  const svgHeight = 240;
  const pad = { top: 20, right: 25, bottom: 35, left: 55 };
  const w = svgWidth - pad.left - pad.right;
  const h = svgHeight - pad.top - pad.bottom;

  const ratios = pairData.map(d => d.ratio);
  const minRatio = ratios.length > 0 ? Math.min(...ratios) * 0.95 : 0;
  const maxRatio = ratios.length > 0 ? Math.max(...ratios) * 1.05 : 1;

  const getX = (i: number) => pad.left + (i / Math.max(1, pairData.length - 1)) * w;
  const getY = (val: number) => {
    if (maxRatio === minRatio) return pad.top + h / 2;
    return pad.top + ((maxRatio - val) / (maxRatio - minRatio)) * h;
  };

  const ratioPath = useMemo(() => {
    return pairData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.ratio)}`).join(' ');
  }, [pairData, maxRatio, minRatio]);

  const sma50Path = useMemo(() => {
    const pts = pairData.map((d, i) => (d.sma50 ? `${getX(i)} ${getY(d.sma50)}` : null)).filter(Boolean);
    return pts.length > 0 ? `M ${pts.join(' L ')}` : '';
  }, [pairData, maxRatio, minRatio]);

  return (
    <div className={`border rounded-xl p-4 sm:p-5 shadow-xl space-y-5 transition-colors ${
      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
    }`}>
      {/* Pair Selector Header */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Single-Pair Econometric Spread & Cointegration Inspector
              </h2>
              <GrandmaTooltip title="Correlation (ρ)" theme={theme} />
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Compare any two stocks side-by-side to watch their ratio and see when they snap back together
            </p>
          </div>
        </div>

        {/* Ticker Dropdown Selectors */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 border rounded-lg p-1.5 text-xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
          }`}>
            <span className={`text-[11px] pl-1 font-semibold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>ASSET A:</span>
            <select
              value={tickerA}
              onChange={e => onChangeTickerA(e.target.value)}
              className={`font-mono font-bold rounded px-2 py-1 border focus:outline-none ${
                isDark ? 'bg-slate-900 text-cyan-400 border-slate-800' : 'bg-white text-cyan-700 border-slate-200 shadow-xs'
              }`}
            >
              {availableTickers.map(t => (
                <option key={t} value={t} disabled={t === tickerB}>
                  {t}
                </option>
              ))}
            </select>

            <span className="text-slate-400 px-1 font-mono">/</span>

            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>ASSET B:</span>
            <select
              value={tickerB}
              onChange={e => onChangeTickerB(e.target.value)}
              className={`font-mono font-bold rounded px-2 py-1 border focus:outline-none ${
                isDark ? 'bg-slate-900 text-indigo-400 border-slate-800' : 'bg-white text-indigo-700 border-slate-200 shadow-xs'
              }`}
            >
              {availableTickers.map(t => (
                <option key={t} value={t} disabled={t === tickerA}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {latestPoint && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] uppercase flex items-center gap-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>Current Price Ratio</span>
              <GrandmaTooltip title="Residual Spread" theme={theme} />
            </div>
            <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{latestPoint.ratio.toFixed(4)}</div>
            <div className={`text-[10px] font-sans mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              ${latestPoint.priceA} / ${latestPoint.priceB}
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] uppercase flex items-center gap-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>Pearson Correlation</span>
              <GrandmaTooltip title="Correlation (ρ)" theme={theme} />
            </div>
            <div className="text-emerald-500 font-bold text-sm">ρ = {correlation.toFixed(2)}</div>
            <div className={`text-[10px] font-sans mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {correlation >= 0.7 ? 'Strong walking buddies' : correlation >= 0.4 ? 'Moderate alignment' : 'Low alignment'}
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] uppercase flex items-center gap-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>50-Day Moving Mean</span>
              <GrandmaTooltip title="Moving Day Averages (SMA)" theme={theme} />
            </div>
            <div className="text-amber-500 font-bold text-sm">
              {latestPoint.sma50 ? latestPoint.sma50.toFixed(4) : latestPoint.mean.toFixed(4)}
            </div>
            <div className={`text-[10px] font-sans mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Home base attractor</div>
          </div>

          <div className={`p-3 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[10px] uppercase flex items-center gap-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>Current Deviation</span>
              <GrandmaTooltip title="Z-Score (Deviation Surprise)" theme={theme} />
            </div>
            <div className={`font-bold text-sm ${Math.abs(latestPoint.zScore) >= zThreshold ? 'text-amber-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {latestPoint.zScore >= 0 ? '+' : ''}{latestPoint.zScore.toFixed(2)}σ
            </div>
            <div className={`text-[10px] font-sans mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {Math.abs(latestPoint.zScore) >= zThreshold ? 'Diverged from each other' : 'Walking together'}
            </div>
          </div>
        </div>
      )}

      {/* Spread Ratio Chart Canvas */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300">
            Price Ratio Trajectory: {tickerA} / {tickerB}
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400" /> Price Ratio ({tickerA}/{tickerB})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400" /> 50-Day SMA
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
          {/* 50-day SMA Path */}
          {sma50Path && (
            <path d={sma50Path} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
          )}

          {/* Ratio Path */}
          <path d={ratioPath} fill="none" stroke="#10b981" strokeWidth="2" />

          {/* Divergence highlight circles */}
          {pairData.map((d, i) => {
            if (d.isDivergent) {
              return (
                <circle
                  key={d.date}
                  cx={getX(i)}
                  cy={getY(d.ratio)}
                  r="3.5"
                  className="fill-amber-400 stroke-slate-950 stroke-2"
                />
              );
            }
            return null;
          })}

          {/* Y Axis Labels */}
          <text x={pad.left - 8} y={getY(maxRatio) + 10} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
            {maxRatio.toFixed(3)}
          </text>
          <text x={pad.left - 8} y={getY(minRatio) - 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
            {minRatio.toFixed(3)}
          </text>

          {/* X Axis Date labels */}
          {pairData.length > 0 && [0, 0.25, 0.5, 0.75, 1].map(frac => {
            const idx = Math.min(pairData.length - 1, Math.floor(frac * (pairData.length - 1)));
            return (
              <text
                key={frac}
                x={getX(idx)}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-mono"
              >
                {pairData[idx]?.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Quant Interpretation */}
      <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
        <div className="font-semibold text-slate-300">Statistical Arbitrage & Pairs Trading Mechanics:</div>
        <p>
          When two historically cointegrated equities deviate significantly beyond their 50-day moving average (e.g. $|Z| \ge {zThreshold}\sigma$), quantitative strategies anticipate a mean-reverting convergence. 
          The spread historically collapses either through the outperforming asset consolidating or the lagging peer catching up as structural market valuation multiples re-equilibrate.
        </p>
      </div>
    </div>
  );
};
