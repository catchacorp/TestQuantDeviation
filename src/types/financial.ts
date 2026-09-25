export interface StockProfile {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  defaultPeerGroup: 'semiconductors' | 'cloud_platforms' | 'high_beta_growth';
  suggestedPeers: string[];
  description: string;
}

export interface PricePoint {
  date: string;       // YYYY-MM-DD
  timestamp: number;  // Epoch ms
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export type HistoricalDataMap = Record<string, PricePoint[]>;

export interface CorrelationMatrix {
  tickers: string[];
  matrix: number[][]; // [i][j] is Pearson correlation between tickers[i] and tickers[j]
  lookbackDays: number;
}

export interface ClusterGroup {
  id: string;
  name: string;
  tickers: string[];
  averageCorrelation: number;
  description: string;
}

export interface RegressionResult {
  alpha: number;      // Intercept
  beta: number;       // Slope
  rSquared: number;   // Coefficient of determination
  stdError: number;
  sampleSize: number;
}

export interface ResidualPoint {
  date: string;
  timestamp: number;
  targetPrice: number;
  benchmarkPrice: number;
  targetLogReturn: number;
  benchmarkLogReturn: number;
  predictedPrice: number;
  residualSpread: number;      // Raw spread (target - predicted or log diff)
  residualSpreadPct: number;   // Percentage deviation
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rollingMean: number;
  rollingStd: number;
  zScore: number;              // Standard deviations from moving mean
  isDivergent: boolean;
}

export interface DivergenceEvent {
  id: string;
  ticker: string;
  peerGroupId: string;
  peerGroupName: string;
  peerTickers: string[];
  startDate: string;
  peakDate: string;
  collapseDate: string | null;  // null if currently active
  isCurrentlyDeviated: boolean;
  maxZScore: number;
  peakSpreadPct: number;
  currentZScore: number;
  currentSpreadPct: number;
  direction: 'UPWARD_OUTPERFORMANCE' | 'DOWNWARD_LAG';
  durationDays: number;
  internalCatalyst: string;
  externalCatalyst: string;
  quantSummary: string;
  mcpSource: string;
  aiDeepDive?: string;
}

export interface RealTimeSignal {
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  expectedPrice: number;
  spreadPct: number;
  zScore: number;
  signalType: 'BUY_LAG' | 'SHORT_SURGE' | 'ALIGNED';
  signalLabel: string;
  peerCohortName: string;
  peerTickers: string[];
  rationale: string;
  grandmaRationale: string;
  potentialMovePct: number;
}

export interface MCPServerInfo {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'idle' | 'simulated';
  transport: 'stdio' | 'sse' | 'http';
  tools: MCPTool[];
  sampleConfig: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPRpcMessage {
  id: string;
  timestamp: string;
  direction: 'client_to_server' | 'server_to_client';
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
}
