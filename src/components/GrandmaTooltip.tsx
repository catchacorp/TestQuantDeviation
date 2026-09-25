import React, { useState } from 'react';
import { HelpCircle, Heart, Lightbulb, X } from 'lucide-react';

interface GrandmaTooltipProps {
  title: string;
  grandmaExplanation?: string;
  quantExplanation?: string;
  theme?: 'dark' | 'light';
  children?: React.ReactNode;
}

export const GRANDMA_DICTIONARY: Record<string, { grandma: string; quant: string }> = {
  'Target Equity': {
    grandma: "This is the star of the show! It's the specific company you want to put under the magnifying glass to see if it's wandering away from its usual friends.",
    quant: "The dependent variable asset being evaluated in the econometric regression against its synthetic peer group benchmark."
  },
  'Peer Group': {
    grandma: "The company's regular walking buddies! Like grocery stores or car makers that usually face the same rain or sunshine, so their stock prices naturally move together.",
    quant: "A cohort of sector-comparable equities exhibiting high mutual Pearson correlation (ρ > 0.60) and cointegrated log-return series."
  },
  'Correlation (ρ)': {
    grandma: "Like two synchronized swimmers! If the score is close to +1.0, they move in total harmony. If it's near 0, they do their own thing. If negative, when one goes up, the other goes down.",
    quant: "Pearson correlation coefficient of continuous logarithmic returns measuring linear co-movement on a scale from -1.0 to +1.0."
  },
  'Residual Spread': {
    grandma: "The gap between where the stock actually is and where its friends stayed! If its friends are sitting quietly at the kitchen table and this stock jumped onto the roof, that gap is the spread.",
    quant: "The error residual e_t = y_t - (α + β·X_t) between the actual normalized price and the OLS regression expected price."
  },
  'Z-Score (Deviation Surprise)': {
    grandma: "Our surprise meter! 0 means completely normal. 1 is slightly odd. 2 or higher is like your quiet neighbor suddenly juggling flaming torches on the lawn — something huge just happened!",
    quant: "Rolling standard deviation normalization Z = (e_t - μ) / σ. Values exceeding ±2.0σ flag statistically significant outlier regimes."
  },
  'Moving Day Averages (SMA)': {
    grandma: "Smoothing out daily hiccups. Like looking at the whole month's temperature rather than worrying about one unusually chilly Tuesday afternoon.",
    quant: "Simple Moving Averages (20-day short trend, 50-day intermediate attractor, 200-day secular trend) filtering out high-frequency market micro-noise."
  },
  'Mean-Reversion / Collapse': {
    grandma: "The rubber band effect! When a stock gets pulled too far away from its walking buddies, reality usually pulls it right back into line sooner or later.",
    quant: "Statistical reversion of the regression residual back towards equilibrium (Z reverting within ±0.65σ of zero) as valuation multiples re-equilibrate."
  },
  'Model Context Protocol (MCP)': {
    grandma: "A secure digital phone line that lets our AI call up Wall Street computers directly to grab fresh, real numbers rather than guessing or making things up.",
    quant: "Open Model Context Protocol (JSON-RPC 2.0) connecting agentic reasoning engines to deterministic production financial data servers."
  },
  'Logarithmic Returns': {
    grandma: "Fair percentage math! If you drop 50% and then gain 50%, normal math says you're even, but you're actually down money! Logarithms keep ups and downs completely honest and symmetric.",
    quant: "Continuous compound return r_t = ln(P_t / P_{t-1}), ensuring time-additivity, symmetry, and statistical normality for linear regression."
  },
  'Beta (β)': {
    grandma: "How energetic the stock is compared to its friends. If Beta is 1.5, when the group walks 1 mile, this stock sprints 1.5 miles. If Beta is 0.8, it strolls more gently.",
    quant: "The slope coefficient in OLS regression measuring sensitivity and systematic volatility of the target equity relative to peer basket movements."
  },
  'R-Squared (R²)': {
    grandma: "A friendship strength score from 0% to 100%! It tells us how much of this stock's ups and downs can be explained simply by looking at what its friends are doing.",
    quant: "Coefficient of determination (0.0 to 1.0) quantifying the fraction of target variance explained by the peer group regression model."
  },
  'Divergence Episodes': {
    grandma: "A diary of times this stock ran off on its own in the past, including the date it took off, the day it reached maximum weirdness, and the date it finally came back home.",
    quant: "Historical clusters of trading days where residual spread exceeded statistical threshold bounds, tracking start date, peak date, collapse date, and catalysts."
  },
  'Why Stocks Are Grouped': {
    grandma: "Explains why these companies are placed in the same sandbox — like sharing the same microchip factories, having the same big tech customers, or facing the same government rules.",
    quant: "Qualitative and fundamental economic attribution explaining structural revenue linkages, supply-chain co-dependencies, and macroeconomic factor exposures."
  }
};

export const GrandmaTooltip: React.FC<GrandmaTooltipProps> = ({
  title,
  grandmaExplanation,
  quantExplanation,
  theme = 'dark',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Look up dictionary if grandmaExplanation not provided directly
  const dict = GRANDMA_DICTIONARY[title];
  const gText = grandmaExplanation || dict?.grandma || "A helpful guide to understand this financial term in simple everyday language.";
  const qText = quantExplanation || dict?.quant;

  const isDark = theme === 'dark';

  return (
    <span className="relative inline-flex items-center">
      {children}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`ml-1 p-0.5 rounded-full transition-colors cursor-help focus:outline-none ${
          isDark
            ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-200'
        }`}
        title={`Explain "${title}" in plain English`}
        aria-label={`Explain ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-xl shadow-2xl text-xs border backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900/95 border-slate-700 text-slate-200 shadow-black/60'
              : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700/50">
            <span className="font-bold flex items-center gap-1.5 text-xs text-emerald-400">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Plain English Guide: {title}</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Grandma's Relatable Explanation */}
          <div className="space-y-2">
            <div className={`p-2.5 rounded-lg border leading-relaxed ${
              isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-emerald-50/70 border-emerald-100 text-slate-700'
            }`}>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mb-1">
                <span>👵 Grandma's Explanation:</span>
              </div>
              <p className="text-xs">{gText}</p>
            </div>

            {/* Technical Quant Definition */}
            {qText && (
              <div className={`p-2 rounded-lg text-[11px] font-mono leading-relaxed ${
                isDark ? 'bg-slate-950/40 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className="text-slate-500 font-sans font-semibold block text-[10px] uppercase">
                  📊 Quant Definition:
                </span>
                {qText}
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
};
