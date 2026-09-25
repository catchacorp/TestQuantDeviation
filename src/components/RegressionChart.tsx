import React, { useState, useMemo } from 'react';
import { ResidualPoint, RegressionResult, PricePoint } from '../types/financial';
import { TrendingUp, Activity, BarChart2, Check, Sliders, Target, Heart } from 'lucide-react';
import { STOCK_PROFILES } from '../data/defaultStocks';
import { GrandmaTooltip } from './GrandmaTooltip';

interface RegressionChartProps {
  targetTicker: string;
  onSelectTargetTicker: (ticker: string) => void;
  availableTickers: string[];
  peerTickers: string[];
  residualPoints: ResidualPoint[];
  regression: RegressionResult;
  zThreshold: number;
  theme?: 'dark' | 'light';
}

export const RegressionChart: React.FC<RegressionChartProps> = ({
  targetTicker,
  onSelectTargetTicker,
  availableTickers,
  peerTickers,
  residualPoints,
  regression,
  zThreshold,
  theme = 'dark'
}) => {
  const [activeTab, setActiveTab] = useState<'spread_zscore' | 'price_comovement' | 'ols_scatter'>('spread_zscore');
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);
  const [showSma200, setShowSma200] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const isDark = theme === 'dark';
  const profile = STOCK_PROFILES[targetTicker];

  // Derived metrics
  const activePoint = hoverIndex !== null && residualPoints[hoverIndex]
    ? residualPoints[hoverIndex]
    : residualPoints[residualPoints.length - 1];

  // Compute SVG dimensions and scales
  const svgWidth = 900;
  const svgHeight = 320;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Scales for Spread / Z-score chart
  const zScores = useMemo(() => residualPoints.map(p => p.zScore), [residualPoints]);
  const minZ = useMemo(() => Math.min(-3.5, Math.min(...zScores, -zThreshold - 0.5)), [zScores, zThreshold]);
  const maxZ = useMemo(() => Math.max(3.5, Math.max(...zScores, zThreshold + 0.5)), [zScores, zThreshold]);

  const getX = (index: number) => {
    if (residualPoints.length <= 1) return padding.left;
    return padding.left + (index / (residualPoints.length - 1)) * chartWidth;
  };

  const getYZ = (z: number) => {
    return padding.top + ((maxZ - z) / (maxZ - minZ)) * chartHeight;
  };

  // Scales for Price Co-movement chart
  const targetPrices = useMemo(() => residualPoints.map(p => p.targetPrice), [residualPoints]);
  const benchPrices = useMemo(() => residualPoints.map(p => p.benchmarkPrice), [residualPoints]);
  const minPrice = useMemo(() => Math.min(...targetPrices) * 0.9, [targetPrices]);
  const maxPrice = useMemo(() => Math.max(...targetPrices) * 1.1, [targetPrices]);

  const getYPrice = (price: number) => {
    if (maxPrice === minPrice) return padding.top + chartHeight / 2;
    return padding.top + ((maxPrice - price) / (maxPrice - minPrice)) * chartHeight;
  };

  // Generate SVG paths
  const zPath = useMemo(() => {
    if (residualPoints.length === 0) return '';
    return residualPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYZ(p.zScore)}`)
      .join(' ');
  }, [residualPoints, maxZ, minZ]);

  const pricePath = useMemo(() => {
    if (residualPoints.length === 0) return '';
    return residualPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYPrice(p.targetPrice)}`)
      .join(' ');
  }, [residualPoints, maxPrice, minPrice]);

  const sma20Path = useMemo(() => {
    const pts = residualPoints
      .map((p, i) => (p.sma20 ? `${getX(i)} ${getYPrice(p.sma20)}` : null))
      .filter(Boolean);
    return pts.length > 0 ? `M ${pts.join(' L ')}` : '';
  }, [residualPoints, maxPrice, minPrice]);

  const sma50Path = useMemo(() => {
    const pts = residualPoints
      .map((p, i) => (p.sma50 ? `${getX(i)} ${getYPrice(p.sma50)}` : null))
      .filter(Boolean);
    return pts.length > 0 ? `M ${pts.join(' L ')}` : '';
  }, [residualPoints, maxPrice, minPrice]);

  const sma200Path = useMemo(() => {
    const pts = residualPoints
      .map((p, i) => (p.sma200 ? `${getX(i)} ${getYPrice(p.sma200)}` : null))
      .filter(Boolean);
    return pts.length > 0 ? `M ${pts.join(' L ')}` : '';
  }, [residualPoints, maxPrice, minPrice]);

  return (
    <div className={`border rounded-xl overflow-hidden shadow-xl transition-colors ${
      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
    }`}>
      {/* Chart Control Header */}
      <div className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold uppercase flex items-center gap-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Equity:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {availableTickers.map(t => {
                const isTarget = targetTicker === t;
                return (
                  <button
                    key={t}
                    onClick={() => onSelectTargetTicker(t)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                      isTarget
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm scale-105'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <GrandmaTooltip title="Target Equity" theme={theme} />
          </div>

          <div className={`text-xs mt-1.5 flex flex-wrap items-center gap-2 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span>Regression against Peer Basket ({peerTickers.join(', ')})</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 font-mono text-cyan-500">
              β: {regression.beta}
              <GrandmaTooltip title="Beta (β)" theme={theme} />
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5 font-mono text-emerald-500">
              R²: {regression.rSquared}
              <GrandmaTooltip title="R-Squared (R²)" theme={theme} />
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center p-0.5 border rounded-lg text-xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('spread_zscore')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'spread_zscore'
                  ? isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Residual Z-Score & Bands
            </button>
            <button
              onClick={() => setActiveTab('price_comovement')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'price_comovement'
                  ? isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Price & Moving Averages
            </button>
            <button
              onClick={() => setActiveTab('ols_scatter')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'ols_scatter'
                  ? isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              OLS Scatter Fit
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-4 sm:p-5">
        {/* Interactive Stats Banner */}
        {activePoint && (
          <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4 p-3 rounded-lg border text-xs font-mono ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className={`text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Trading Date</div>
              <div className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{activePoint.date}</div>
            </div>
            <div>
              <div className={`text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{targetTicker} Close</div>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${activePoint.targetPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className={`text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>OLS Expected</div>
              <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>${activePoint.predictedPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className={`text-[10px] uppercase flex items-center gap-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Residual Spread</span>
                <GrandmaTooltip title="Residual Spread" theme={theme} />
              </div>
              <div className={`font-bold ${activePoint.residualSpreadPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {activePoint.residualSpreadPct >= 0 ? '+' : ''}{activePoint.residualSpreadPct.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className={`text-[10px] uppercase flex items-center gap-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Surprise (Z-Score)</span>
                <GrandmaTooltip title="Z-Score (Deviation Surprise)" theme={theme} />
              </div>
              <div className={`font-bold ${Math.abs(activePoint.zScore) >= zThreshold ? 'text-amber-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {activePoint.zScore >= 0 ? '+' : ''}{activePoint.zScore.toFixed(2)}σ
                {Math.abs(activePoint.zScore) >= zThreshold && ' (Divergent)'}
              </div>
            </div>
          </div>
        )}

        {/* View 1: Spread Z-Score with ±Threshold Bands */}
        {activeTab === 'spread_zscore' && (
          <div className="relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              onMouseLeave={() => setHoverIndex(null)}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
                const relX = mouseX - padding.left;
                if (relX >= 0 && relX <= chartWidth && residualPoints.length > 0) {
                  const idx = Math.round((relX / chartWidth) * (residualPoints.length - 1));
                  setHoverIndex(Math.max(0, Math.min(residualPoints.length - 1, idx)));
                }
              }}
            >
              {/* Zero Line (Mean Equilibrium) */}
              <line
                x1={padding.left}
                y1={getYZ(0)}
                x2={svgWidth - padding.right}
                y2={getYZ(0)}
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={padding.left - 8} y={getYZ(0) + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                0.0σ
              </text>

              {/* Upper Z Threshold Band */}
              <line
                x1={padding.left}
                y1={getYZ(zThreshold)}
                x2={svgWidth - padding.right}
                y2={getYZ(zThreshold)}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text x={padding.left - 8} y={getYZ(zThreshold) + 4} textAnchor="end" className="text-[10px] fill-amber-400 font-mono">
                +{zThreshold}σ
              </text>

              {/* Lower Z Threshold Band */}
              <line
                x1={padding.left}
                y1={getYZ(-zThreshold)}
                x2={svgWidth - padding.right}
                y2={getYZ(-zThreshold)}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text x={padding.left - 8} y={getYZ(-zThreshold) + 4} textAnchor="end" className="text-[10px] fill-amber-400 font-mono">
                -{zThreshold}σ
              </text>

              {/* Z-Score Trajectory Path */}
              <path
                d={zPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Highlight points exceeding threshold */}
              {residualPoints.map((pt, i) => {
                if (Math.abs(pt.zScore) >= zThreshold) {
                  return (
                    <circle
                      key={pt.date}
                      cx={getX(i)}
                      cy={getYZ(pt.zScore)}
                      r="3.5"
                      className="fill-amber-400 stroke-slate-950 stroke-2"
                    />
                  );
                }
                return null;
              })}

              {/* Crosshair cursor */}
              {hoverIndex !== null && (
                <g>
                  <line
                    x1={getX(hoverIndex)}
                    y1={padding.top}
                    x2={getX(hoverIndex)}
                    y2={svgHeight - padding.bottom}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={getX(hoverIndex)}
                    cy={getYZ(residualPoints[hoverIndex].zScore)}
                    r="5"
                    className="fill-emerald-400 stroke-white stroke-2"
                  />
                </g>
              )}

              {/* X-axis date milestones */}
              {residualPoints.length > 0 && [0, 0.25, 0.5, 0.75, 1].map(frac => {
                const idx = Math.min(residualPoints.length - 1, Math.floor(frac * (residualPoints.length - 1)));
                return (
                  <text
                    key={frac}
                    x={getX(idx)}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {residualPoints[idx]?.date}
                  </text>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-400 rounded-full" /> Rolling Residual Z-Score
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 border border-dashed rounded-full" /> ±{zThreshold}σ Divergence Bounds
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Statistical Divergence Point
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Log-return standard deviation: 30-day rolling window</span>
            </div>
          </div>
        )}

        {/* View 2: Price Trajectory & Moving Day Averages */}
        {activeTab === 'price_comovement' && (
          <div>
            {/* SMA Toggles */}
            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Moving Day Averages:
              </span>
              <button
                onClick={() => setShowSma20(!showSma20)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition-colors ${
                  showSma20 ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                <span className="w-2 h-0.5 bg-cyan-400" /> 20-Day SMA
              </button>
              <button
                onClick={() => setShowSma50(!showSma50)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition-colors ${
                  showSma50 ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                <span className="w-2 h-0.5 bg-amber-400" /> 50-Day SMA
              </button>
              <button
                onClick={() => setShowSma200(!showSma200)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition-colors ${
                  showSma200 ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                <span className="w-2 h-0.5 bg-purple-400" /> 200-Day SMA
              </button>
            </div>

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              onMouseLeave={() => setHoverIndex(null)}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
                const relX = mouseX - padding.left;
                if (relX >= 0 && relX <= chartWidth && residualPoints.length > 0) {
                  const idx = Math.round((relX / chartWidth) * (residualPoints.length - 1));
                  setHoverIndex(Math.max(0, Math.min(residualPoints.length - 1, idx)));
                }
              }}
            >
              {/* Target Price Path */}
              <path
                d={pricePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* SMAs */}
              {showSma20 && sma20Path && (
                <path d={sma20Path} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
              )}
              {showSma50 && sma50Path && (
                <path d={sma50Path} fill="none" stroke="#fbbf24" strokeWidth="1.5" />
              )}
              {showSma200 && sma200Path && (
                <path d={sma200Path} fill="none" stroke="#c084fc" strokeWidth="1.5" />
              )}

              {/* Y Axis Price Labels */}
              <text x={padding.left - 8} y={getYPrice(maxPrice) + 12} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                ${maxPrice.toFixed(0)}
              </text>
              <text x={padding.left - 8} y={getYPrice((maxPrice + minPrice) / 2)} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                ${((maxPrice + minPrice) / 2).toFixed(0)}
              </text>
              <text x={padding.left - 8} y={getYPrice(minPrice) - 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                ${minPrice.toFixed(0)}
              </text>

              {/* Crosshair cursor */}
              {hoverIndex !== null && (
                <g>
                  <line
                    x1={getX(hoverIndex)}
                    y1={padding.top}
                    x2={getX(hoverIndex)}
                    y2={svgHeight - padding.bottom}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={getX(hoverIndex)}
                    cy={getYPrice(residualPoints[hoverIndex].targetPrice)}
                    r="5"
                    className="fill-cyan-400 stroke-white stroke-2"
                  />
                </g>
              )}

              {/* X-axis date labels */}
              {residualPoints.length > 0 && [0, 0.25, 0.5, 0.75, 1].map(frac => {
                const idx = Math.min(residualPoints.length - 1, Math.floor(frac * (residualPoints.length - 1)));
                return (
                  <text
                    key={frac}
                    x={getX(idx)}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {residualPoints[idx]?.date}
                  </text>
                );
              })}
            </svg>
          </div>
        )}

        {/* View 3: OLS Scatter Fit */}
        {activeTab === 'ols_scatter' && (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-semibold text-slate-300">
                Ordinary Least Squares (OLS) Linear Co-movement Fit
              </span>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">Model: <span className="text-cyan-400">y = {regression.alpha} + {regression.beta}x</span></span>
                <span className="text-emerald-400">R² = {regression.rSquared}</span>
                <span className="text-slate-400">Std Error = {regression.stdError}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              OLS regression models the expected normalized valuation trajectory of <strong className="text-white">{targetTicker}</strong> based on the weighted returns of its correlated peer group ({peerTickers.join(', ')}). 
              A high R-squared of <strong className="text-emerald-400">{regression.rSquared}</strong> validates strong continuous co-movement, confirming that sudden residual spreads represent true statistical anomalies rather than random noise.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
