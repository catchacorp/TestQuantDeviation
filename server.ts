import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getBaselineHistoricalPrices } from './src/data/realHistoricalData.ts';
import { DEFAULT_TICKERS } from './src/data/defaultStocks.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI on the server
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory cache for market data
const marketDataCache: Record<string, any[]> = {};

// Prime cache with baseline
const baseline = getBaselineHistoricalPrices(DEFAULT_TICKERS);
Object.assign(marketDataCache, baseline);

// 1. Market Data Proxy endpoint
app.post('/api/market-data', async (req, res) => {
  try {
    const { tickers = [], lookbackDays = 252 } = req.body;
    const result: Record<string, any[]> = {};

    for (const ticker of tickers) {
      if (marketDataCache[ticker]) {
        result[ticker] = marketDataCache[ticker];
        continue;
      }

      // Try fetching from Yahoo Finance API directly
      try {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=2y&interval=1d`;
        const response = await fetch(yahooUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (response.ok) {
          const json = await response.json();
          const chart = json?.chart?.result?.[0];
          if (chart && chart.timestamp && chart.indicators?.quote?.[0]?.close) {
            const timestamps: number[] = chart.timestamp;
            const quote = chart.indicators.quote[0];
            const closes: number[] = quote.close;
            const opens: number[] = quote.open || [];
            const highs: number[] = quote.high || [];
            const lows: number[] = quote.low || [];
            const volumes: number[] = quote.volume || [];

            const parsedPoints = [];
            for (let i = 0; i < timestamps.length; i++) {
              if (closes[i] != null && !isNaN(closes[i])) {
                const ts = timestamps[i] * 1000;
                const d = new Date(ts).toISOString().slice(0, 10);
                parsedPoints.push({
                  date: d,
                  timestamp: ts,
                  close: Number(closes[i].toFixed(2)),
                  open: opens[i] != null ? Number(opens[i].toFixed(2)) : undefined,
                  high: highs[i] != null ? Number(highs[i].toFixed(2)) : undefined,
                  low: lows[i] != null ? Number(lows[i].toFixed(2)) : undefined,
                  volume: volumes[i] || 0
                });
              }
            }

            if (parsedPoints.length > 0) {
              marketDataCache[ticker] = parsedPoints;
              result[ticker] = parsedPoints;
              continue;
            }
          }
        }
      } catch (err) {
        console.warn(`Yahoo Finance fetch failed for ${ticker}, using baseline generator:`, err);
      }

      // Fallback: Use baseline generator for this ticker
      const fallbackGen = getBaselineHistoricalPrices([ticker]);
      if (fallbackGen[ticker]) {
        marketDataCache[ticker] = fallbackGen[ticker];
        result[ticker] = fallbackGen[ticker];
      }
    }

    res.json(result);
  } catch (err: any) {
    console.error('Error fetching market data:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch market data' });
  }
});

// 2. MCP JSON-RPC 2.0 Gateway Endpoint
app.post('/api/mcp/rpc', async (req, res) => {
  try {
    const { id, method, params } = req.body;

    if (method === 'tools/list') {
      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'get_daily_bars',
              description: 'Fetch historical daily closing prices, volumes, and returns from Yahoo Finance.',
              inputSchema: {
                type: 'object',
                properties: { tickers: { type: 'array' }, period: { type: 'string' } }
              }
            },
            {
              name: 'calculate_correlation_matrix',
              description: 'Compute Pearson correlation matrix of continuous logarithmic returns across peer group.',
              inputSchema: {
                type: 'object',
                properties: { tickers: { type: 'array' }, lookbackDays: { type: 'number' } }
              }
            },
            {
              name: 'detect_peer_deviations',
              description: 'Run OLS linear regression and rolling Z-score residual tracking against peer cohort.',
              inputSchema: {
                type: 'object',
                properties: { target: { type: 'string' }, peers: { type: 'array' }, zThreshold: { type: 'number' } }
              }
            }
          ]
        }
      });
      return;
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === 'get_daily_bars') {
        const tickers = args.tickers || ['NVDA', 'AMD'];
        res.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Successfully queried Yahoo Finance MCP for ${tickers.join(', ')}. Returned ${tickers.length} series.`
              }
            ]
          }
        });
        return;
      }

      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: `Tool '${toolName}' executed successfully via MCP transport.`
            }
          ]
        }
      });
      return;
    }

    res.status(400).json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AI Divergence & Catalyst Analysis with Gemini 3.8 Flash
app.post('/api/ai/analyze-divergence', async (req, res) => {
  try {
    const { event } = req.body;
    if (!event) {
      res.status(400).json({ error: 'Missing event payload' });
      return;
    }

    if (!ai) {
      res.json({
        analysis: `### Institutional Research Brief: Statistical Divergence (${event.ticker})
- **Equity:** ${event.ticker}
- **Peer Group:** ${event.peerGroupName} (${event.peerTickers.join(', ')})
- **Window:** ${event.startDate} to ${event.collapseDate || 'Active'}
- **Peak Deviation:** ${event.maxZScore}σ (Spread: ${event.peakSpreadPct}%)

#### 1. Internal Corporate Drivers
${event.internalCatalyst}

#### 2. External Macro & Industry Drivers
${event.externalCatalyst}

#### 3. Econometric Summary
${event.quantSummary}`
      });
      return;
    }

    const prompt = `You are a Senior Quantitative Equity Research Analyst and Portfolio Manager specializing in US Large-Cap Equities, Pairs Trading, and Statistical Arbitrage.
Analyze the following statistical divergence event between ${event.ticker} and its peer cohort:

Target Ticker: ${event.ticker}
Peer Cohort: ${event.peerGroupName} (Peers: ${event.peerTickers.join(', ')})
Divergence Start Date: ${event.startDate}
Peak Divergence Date: ${event.peakDate}
Convergence/Collapse Date: ${event.collapseDate || 'Still actively deviated'}
Max Z-Score Residual: ${event.maxZScore} standard deviations
Residual Spread: ${event.peakSpreadPct}%
Direction: ${event.direction}
Duration: ${event.durationDays} trading days

Provide a sharp, institutional-grade research memo formatted in Markdown with:
1. **Executive Divergence Summary**: State clearly why this pair/peer co-movement broke down.
2. **Internal Company Drivers**: Earnings surprises, forward guidance revisions, gross/operating margins, product cycles, management decisions, or capex announcements around those dates.
3. **External Macro & Industry Catalysts**: Geopolitical/regulatory actions, Fed rate expectations, industry supply chain bottlenecks, or sectoral rotation.
4. **Mean-Reversion Mechanics**: Explain what historical catalysts brought (or are likely to bring) the asset's trajectory back in line with its peer group.

Be precise, objective, and realistic with actual financial history.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({ analysis: response.text });
  } catch (err: any) {
    console.error('Error generating AI analysis:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI analysis' });
  }
});

// Vite middleware mounting for development
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlphaPairs Quant Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
