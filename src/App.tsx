import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TickerBar } from './components/TickerBar';
import { DivergenceTable } from './components/DivergenceTable';
import { RegressionChart } from './components/RegressionChart';
import { CorrelationHeatmap } from './components/CorrelationHeatmap';
import { PairInspector } from './components/PairInspector';
import { PeerGroupingExplainerTab } from './components/PeerGroupingExplainerTab';
import { McpInspectorModal } from './components/McpInspectorModal';
import { AiMemoModal } from './components/AiMemoModal';
import { DEFAULT_TICKERS, STOCK_PROFILES } from './data/defaultStocks';
import { mcpService } from './services/mcpFinancialService';
import {
  generateCorrelationMatrix,
  clusterPeersByCorrelation,
  buildPeerBenchmarkSeries,
  calculateResidualSpreadAndZScores,
  detectDivergenceEpisodes
} from './services/quantEngine';
import {
  HistoricalDataMap,
  DivergenceEvent,
  CorrelationMatrix,
  ClusterGroup
} from './types/financial';
import {
  Activity,
  Layers,
  BarChart3,
  Network,
  ArrowLeftRight,
  Server,
  AlertTriangle,
  Sparkles,
  Info,
  Boxes,
  Heart
} from 'lucide-react';
import { GrandmaTooltip } from './components/GrandmaTooltip';

export default function App() {
  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Quantitative State
  const [selectedTickers, setSelectedTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [targetTicker, setTargetTicker] = useState<string>('NVDA');
  const [lookbackDays, setLookbackDays] = useState<number>(252);
  const [zThreshold, setZThreshold] = useState<number>(1.95);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pair Inspector State
  const [pairA, setPairA] = useState<string>('NVDA');
  const [pairB, setPairB] = useState<string>('AMD');

  // Navigation View Tabs
  const [activeTab, setActiveTab] = useState<'episodes' | 'charts' | 'correlation' | 'pairs' | 'peer_logic'>('episodes');

  // Market Data & Computed Analytics Cache
  const [historicalData, setHistoricalData] = useState<HistoricalDataMap>({});

  // Modals State
  const [isMcpModalOpen, setIsMcpModalOpen] = useState<boolean>(false);
  const [aiMemoEvent, setAiMemoEvent] = useState<DivergenceEvent | null>(null);
  const [tableTickerFilter, setTableTickerFilter] = useState<string | null>(null);

  // Load / Refresh Market Data via MCP Service
  const loadMarketData = async (tickersToFetch = selectedTickers) => {
    setIsLoading(true);
    try {
      const data = await mcpService.fetchHistoricalData(tickersToFetch, lookbackDays);
      setHistoricalData(data);
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData(selectedTickers);
  }, [selectedTickers, lookbackDays]);

  // Compute Correlation Matrix
  const correlationMatrix: CorrelationMatrix = useMemo(() => {
    return generateCorrelationMatrix(historicalData, lookbackDays);
  }, [historicalData, lookbackDays]);

  // Compute Peer Clusters
  const clusters: ClusterGroup[] = useMemo(() => {
    if (correlationMatrix.tickers.length === 0) return [];
    return clusterPeersByCorrelation(correlationMatrix, 0.45);
  }, [correlationMatrix]);

  // Determine peer group for the current target ticker
  const targetPeers = useMemo(() => {
    // Find which cluster contains the target ticker
    const matchingCluster = clusters.find(c => c.tickers.includes(targetTicker));
    if (matchingCluster && matchingCluster.tickers.length > 1) {
      return matchingCluster.tickers.filter(t => t !== targetTicker);
    }
    // Fallback: Use profile suggested peers that exist in active tickers
    const prof = STOCK_PROFILES[targetTicker];
    if (prof) {
      const available = prof.suggestedPeers.filter(t => selectedTickers.includes(t));
      if (available.length > 0) return available;
    }
    // General fallback: other selected tickers
    return selectedTickers.filter(t => t !== targetTicker).slice(0, 4);
  }, [targetTicker, clusters, selectedTickers]);

  // Synthetic peer benchmark series for target ticker
  const benchmarkSeries = useMemo(() => {
    return buildPeerBenchmarkSeries(targetPeers, historicalData);
  }, [targetPeers, historicalData]);

  // Regression & Residuals for Target Ticker
  const { residualPoints, regression } = useMemo(() => {
    const targetPrices = historicalData[targetTicker] || [];
    return calculateResidualSpreadAndZScores(targetPrices, benchmarkSeries, 30, zThreshold);
  }, [targetTicker, historicalData, benchmarkSeries, zThreshold]);

  // Aggregate Divergence Episodes across all active equities
  const allDivergenceEpisodes = useMemo(() => {
    const episodes: DivergenceEvent[] = [];

    for (const ticker of selectedTickers) {
      const cluster = clusters.find(c => c.tickers.includes(ticker));
      const peers = cluster
        ? cluster.tickers.filter(t => t !== ticker)
        : selectedTickers.filter(t => t !== ticker).slice(0, 4);

      if (peers.length === 0) continue;

      const bench = buildPeerBenchmarkSeries(peers, historicalData);
      const targetPrices = historicalData[ticker] || [];
      const { residualPoints: resPts } = calculateResidualSpreadAndZScores(targetPrices, bench, 30, zThreshold);

      const detected = detectDivergenceEpisodes(
        ticker,
        cluster?.id || 'cluster_gen',
        cluster?.name || 'Correlated Tech Cohort',
        peers,
        resPts,
        zThreshold
      );

      episodes.push(...detected);
    }

    // Sort by latest episode start date
    return episodes.sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [selectedTickers, clusters, historicalData, zThreshold]);

  // Count active deviations
  const activeDivergences = useMemo(() => {
    return allDivergenceEpisodes.filter(e => e.isCurrentlyDeviated);
  }, [allDivergenceEpisodes]);

  // Ticker Handlers
  const handleAddTicker = (ticker: string) => {
    if (!selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    if (selectedTickers.length > 2) {
      const updated = selectedTickers.filter(t => t !== ticker);
      setSelectedTickers(updated);
      if (targetTicker === ticker) {
        setTargetTicker(updated[0]);
      }
    }
  };

  const handleSelectPreset = (tickers: string[]) => {
    setSelectedTickers(tickers);
    setTargetTicker(tickers[0]);
  };

  const handleSelectPairFromHeatmap = (tickerA: string, tickerB: string) => {
    setPairA(tickerA);
    setPairB(tickerB);
    setActiveTab('pairs');
  };

  const handleFilterByCluster = (clusterTickers: string[]) => {
    setTargetTicker(clusterTickers[0]);
    setActiveTab('charts');
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors selection:bg-emerald-500/30 selection:text-white ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Application Header */}
      <Header
        lookbackDays={lookbackDays}
        setLookbackDays={setLookbackDays}
        zThreshold={zThreshold}
        setZThreshold={setZThreshold}
        onOpenMcpModal={() => setIsMcpModalOpen(true)}
        onRefreshData={() => loadMarketData()}
        isLoading={isLoading}
        activeDivergenceCount={activeDivergences.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        targetTicker={targetTicker}
      />

      {/* Ticker Management & Spotlight Target Equity */}
      <TickerBar
        selectedTickers={selectedTickers}
        targetTicker={targetTicker}
        onSelectTargetTicker={setTargetTicker}
        onAddTicker={handleAddTicker}
        onRemoveTicker={handleRemoveTicker}
        onSelectPreset={handleSelectPreset}
        historicalData={historicalData}
        theme={theme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Active Deviation Alert Banner */}
        {activeDivergences.length > 0 && (
          <div className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
            isDark ? 'bg-amber-950/30 border-amber-800/60' : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-sm font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                  Active Statistical Trajectory Divergence ({activeDivergences.length})
                </div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                  {activeDivergences.map(d => `${d.ticker} (${d.maxZScore}σ)`).join(' · ')}
                  {' have wandered away from their usual peer group co-movement trend.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setTargetTicker(activeDivergences[0].ticker);
                setActiveTab('charts');
              }}
              className="text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm"
            >
              Inspect {activeDivergences[0].ticker} Spread
            </button>
          </div>
        )}

        {/* Primary View Navigation Tabs */}
        <div className={`border-b flex flex-wrap items-center gap-1 sm:gap-2 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('episodes')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'episodes'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Divergence Episodes ({allDivergenceEpisodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'charts'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Regression & Moving Averages</span>
          </button>

          <button
            onClick={() => setActiveTab('correlation')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'correlation'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Peer Clusters & Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('pairs')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pairs'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-purple-400" />
            <span>Single-Pair Inspector</span>
          </button>

          {/* NEW TAB: Why Stocks Are Grouped Together */}
          <button
            onClick={() => setActiveTab('peer_logic')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'peer_logic'
                ? 'border-emerald-500 text-emerald-500 font-bold'
                : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-emerald-400" />
            <span>Why Stocks Are Grouped</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
              New
            </span>
          </button>
        </div>

        {/* View 1: Divergence Episodes Table with Start, Peak, Collapse Dates & Catalysts */}
        {activeTab === 'episodes' && (
          <DivergenceTable
            events={allDivergenceEpisodes}
            onSelectEventForAi={event => setAiMemoEvent(event)}
            selectedTickerFilter={tableTickerFilter}
            onSelectTickerFilter={ticker => setTableTickerFilter(ticker)}
            theme={theme}
          />
        )}

        {/* View 2: Regression & Moving Day Average Spread Charts */}
        {activeTab === 'charts' && (
          <RegressionChart
            targetTicker={targetTicker}
            onSelectTargetTicker={t => setTargetTicker(t)}
            availableTickers={selectedTickers}
            peerTickers={targetPeers}
            residualPoints={residualPoints}
            regression={regression}
            zThreshold={zThreshold}
            theme={theme}
          />
        )}

        {/* View 3: Pearson Correlation Matrix & Peer Clustering */}
        {activeTab === 'correlation' && (
          <CorrelationHeatmap
            correlationMatrix={correlationMatrix}
            clusters={clusters}
            onSelectPair={handleSelectPairFromHeatmap}
            onFilterByCluster={handleFilterByCluster}
            theme={theme}
          />
        )}

        {/* View 4: Single Pair Cointegration & Mean-Reversion Inspector */}
        {activeTab === 'pairs' && (
          <PairInspector
            tickerA={pairA}
            tickerB={pairB}
            onChangeTickerA={setPairA}
            onChangeTickerB={setPairB}
            availableTickers={selectedTickers}
            historicalData={historicalData}
            zThreshold={zThreshold}
            theme={theme}
          />
        )}

        {/* View 5: Dedicated Tab - Why Stocks Are Grouped to Those Peers */}
        {activeTab === 'peer_logic' && (
          <PeerGroupingExplainerTab
            selectedStock={targetTicker}
            onSelectStock={setTargetTicker}
            availableTickers={selectedTickers}
            theme={theme}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 px-4 sm:px-6 text-xs transition-colors ${
        isDark ? 'border-slate-800 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>AlphaPairs Quant</span>
            <span>·</span>
            <span>Econometric Equities Model Context Protocol Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="hover:text-emerald-500 transition-colors flex items-center gap-1 font-medium"
            >
              <Server className="w-3.5 h-3.5" /> MCP Server Protocol (Production Ready)
            </button>
            <span>·</span>
            <span>Vercel / GitHub Ready</span>
          </div>
        </div>
      </footer>

      {/* MCP Architecture Modal */}
      <McpInspectorModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        theme={theme}
      />

      {/* AI Research Memo Deep Dive Modal */}
      <AiMemoModal
        event={aiMemoEvent}
        onClose={() => setAiMemoEvent(null)}
        theme={theme}
      />
    </div>
  );
}

