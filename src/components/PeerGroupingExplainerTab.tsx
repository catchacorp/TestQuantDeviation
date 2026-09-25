import React, { useState } from 'react';
import { STOCK_PROFILES, INDUSTRY_CATEGORIES } from '../data/defaultStocks';
import {
  Users,
  Cpu,
  Cloud,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Link,
  Boxes
} from 'lucide-react';
import { GrandmaTooltip } from './GrandmaTooltip';

interface PeerGroupingExplainerTabProps {
  selectedStock: string;
  onSelectStock: (ticker: string) => void;
  availableTickers: string[];
  theme?: 'dark' | 'light';
}

interface PeerExplanation {
  groupName: string;
  groupType: string;
  whyInPlainEnglish: string;
  sharedCustomers: string;
  sharedSuppliers: string;
  whyPricesMoveTogether: string;
  famousDivergenceStory: string;
  keyPeers: string[];
  grandmaAnalogy: string;
}

export const PEER_GROUP_EXPLANATIONS: Record<string, PeerExplanation> = {
  NVDA: {
    groupName: 'Semiconductor & AI Hardware Peers',
    groupType: 'AI Accelerated Computing & Silicon Fabric',
    keyPeers: ['AMD', 'AVGO', 'MU', 'TSM'],
    grandmaAnalogy: 'Think of them like bakers in the same high-end bakery district. When everyone in town suddenly wants wedding cakes (AI computing), all these bakeries get busy together!',
    whyInPlainEnglish: 'Nvidia makes the specialized computer brains (GPUs) that power artificial intelligence. It is grouped with AMD, Broadcom, and Micron because they all live in the exact same semiconductor neighborhood.',
    sharedCustomers: 'Microsoft, Google, Meta, Amazon, and Oracle purchase massive clusters of Nvidia chips alongside Broadcom networking and Micron memory.',
    sharedSuppliers: 'Almost all of them rely on TSMC (Taiwan Semiconductor) to physically manufacture their microchips using advanced packaging factories.',
    whyPricesMoveTogether: 'When big tech companies announce they are investing hundreds of billions into AI data centers, all four companies immediately benefit. When microchip export rules tighten, all four face headwinds.',
    famousDivergenceStory: 'In May 2023, Nvidia shot up 25% in a single day because it had working AI chips ready to ship immediately, while AMD was still finishing its MI300 chip. By early 2024, AMD caught up and narrowed the gap.'
  },
  AMD: {
    groupName: 'Semiconductor & AI Hardware Peers',
    groupType: 'Advanced Microprocessors & Accelerated AI',
    keyPeers: ['NVDA', 'AVGO', 'MU', 'INTC'],
    grandmaAnalogy: 'Like Pepsi to Nvidia\'s Coke! Whenever restaurants and grocery stores want microchips, they look at both to keep prices competitive.',
    whyInPlainEnglish: 'AMD is Nvidia\'s primary direct rival in high-end computer chips and Intel\'s rival in server processors. It is grouped with other chipmakers because its revenue follows the exact same global electronics rhythm.',
    sharedCustomers: 'Cloud data center builders, PC manufacturers (Dell, HP, Lenovo), and gaming console makers (Sony PlayStation, Microsoft Xbox).',
    sharedSuppliers: 'TSMC for silicon fabrication, and ASE/Amkor for microchip packaging.',
    whyPricesMoveTogether: 'Whenever corporate spending on computer servers accelerates, AMD\'s earnings rise alongside Nvidia and Broadcom.',
    famousDivergenceStory: 'When Nvidia surged in mid-2023, AMD temporarily lagged behind. But when AMD officially launched its Instinct MI300 AI chip in December 2023, its stock surged +70% over the following months, catching right back up to its peer group trend.'
  },
  AVGO: {
    groupName: 'Semiconductor & Enterprise Networking Peers',
    groupType: 'Custom AI ASICs & Data Fabric',
    keyPeers: ['NVDA', 'AMD', 'MU', 'MRVL'],
    grandmaAnalogy: 'Like the highway builders and postal service of the computer world. If Nvidia and AMD make the fast sports cars, Broadcom builds the 10-lane highway they drive on!',
    whyInPlainEnglish: 'Broadcom designs the ultra-fast network switches that connect thousands of AI chips together, plus custom microchips for Google. It moves alongside Nvidia and AMD because an AI data center cannot function without both.',
    sharedCustomers: 'Google (co-developing Google TPU chips), Meta, Apple (wireless components), and large Fortune 500 enterprises using VMware software.',
    sharedSuppliers: 'TSMC advanced packaging and global silicon foundries.',
    whyPricesMoveTogether: 'Every time a tech giant orders 50,000 Nvidia GPUs, they must also buy Broadcom network switches and optical cables to connect them, making their sales move hand-in-hand.',
    famousDivergenceStory: 'In late 2023, Broadcom finalized its $69 Billion acquisition of VMware and secured massive multi-billion-dollar custom AI chip orders from Google and Meta, causing it to surge and re-align with top-tier AI leaders.'
  },
  MU: {
    groupName: 'Semiconductor - Memory & Storage Peers',
    groupType: 'High-Bandwidth Memory (HBM) & DRAM',
    keyPeers: ['NVDA', 'AMD', 'AVGO', 'WDC'],
    grandmaAnalogy: 'Like the desk space next to the computer brain. Even the fastest genius (Nvidia) can\'t think without a giant desk (Micron memory) to hold all the papers!',
    whyInPlainEnglish: 'Micron makes the high-speed memory chips (DRAM & HBM) that sit directly adjacent to Nvidia and AMD processors. It is grouped with them because modern AI chips physically require Micron\'s memory stacks to function.',
    sharedCustomers: 'Nvidia (qualifying Micron HBM3e memory for H200 and Blackwell servers), smartphone makers, and enterprise storage buyers.',
    sharedSuppliers: 'Wafer manufacturing equipment makers like ASML, Applied Materials, and Lam Research.',
    whyPricesMoveTogether: 'When the memory chip industry recovers from an oversupply, memory prices surge and Micron stock rallies alongside the broader semiconductor index.',
    famousDivergenceStory: 'In early 2024, Micron announced that its entire production capacity of High-Bandwidth Memory for AI was completely sold out for over a year, causing a violent 80% catch-up rally that re-anchored it with Nvidia.'
  },
  META: {
    groupName: 'Mega-Cap Cloud & Digital Advertising Peers',
    groupType: 'Social Media & Open-Source AI Infrastructure',
    keyPeers: ['GOOGL', 'AMZN', 'MSFT', 'AAPL'],
    grandmaAnalogy: 'Like newspaper and billboard titans in the digital world. They and Google drink from the exact same punch bowl: corporate advertising budgets.',
    whyInPlainEnglish: 'Meta owns Facebook, Instagram, and WhatsApp. It is grouped with Alphabet (Google), Amazon, and Microsoft because they are all multi-trillion-dollar digital platform monopolies whose profits are tied to global consumer attention and digital ad spending.',
    sharedCustomers: 'Millions of global small businesses, retail brands, and enterprise advertisers bidding on digital ad auctions.',
    sharedSuppliers: 'Buys hundreds of thousands of Nvidia GPUs and rents datacenter energy to train their Llama open-source AI models.',
    whyPricesMoveTogether: 'When consumer spending is strong, companies spend heavily on Facebook and Google ads. When the economy slows or interest rates rise, ad budgets across both platforms move together.',
    famousDivergenceStory: 'In 2022, Meta crashed -65% after spending tens of billions on the "Metaverse" while Apple changed iPhone privacy settings. But in February 2023, Mark Zuckerberg launched the "Year of Efficiency," laid off excess staff, initiated Meta\'s first dividend, and the stock staged a legendary +200% mean-reverting recovery to rejoin Microsoft and Apple.'
  },
  GOOGL: {
    groupName: 'Mega-Cap Cloud & Digital Advertising Peers',
    groupType: 'Search, Streaming Video & Cloud Infrastructure',
    keyPeers: ['META', 'MSFT', 'AMZN', 'AAPL'],
    grandmaAnalogy: 'The digital phonebook and library of the world. Shares the exact same economic heartbeat as Meta and Microsoft.',
    whyInPlainEnglish: 'Alphabet owns Google Search, YouTube, Android, and Google Cloud. It moves with Meta because together they dominate global online ads, and it moves with Microsoft and Amazon because they compete for corporate cloud hosting.',
    sharedCustomers: 'Global retail advertisers, Fortune 500 enterprise IT departments, and billions of daily smartphone users.',
    sharedSuppliers: 'Data center power grids, server hardware from Dell, Supermicro, Broadcom, and Nvidia.',
    whyPricesMoveTogether: 'Whenever Wall Street assesses the overall health of enterprise technology and online consumer commerce, Google and its peers move in lockstep.',
    famousDivergenceStory: 'In early 2023, Google temporarily dipped when its first AI demo had a minor factual slip-up, while Microsoft surged on OpenAI Copilot. Over the next year, Google rolled out Gemini and Cloud profitability, completely eliminating the temporary discount.'
  },
  MSFT: {
    groupName: 'Mega-Cap Cloud & Enterprise Software Peers',
    groupType: 'Enterprise Cloud (Azure) & Workplace Software',
    keyPeers: ['GOOGL', 'AMZN', 'META', 'AAPL'],
    grandmaAnalogy: 'The digital office landlord of the corporate world. Every business pays Microsoft monthly rent for Windows, Office, and Azure servers.',
    whyInPlainEnglish: 'Microsoft powers enterprise corporate software (Office 365, Teams) and the Azure cloud. It is grouped with Amazon (AWS) and Google Cloud because all three sell the essential computer infrastructure of modern business.',
    sharedCustomers: 'Virtually every Fortune 500 company, government agency, school, and university.',
    sharedSuppliers: 'Data center server hardware, green energy utilities, and advanced chip designers.',
    whyPricesMoveTogether: 'Institutional investors treat Microsoft, Google, and Amazon as safe-haven "core tech" anchors. When money flows into big tech, all three rise together.',
    famousDivergenceStory: 'In early 2023, Microsoft was the first to launch Copilot with OpenAI, causing a strong upward divergence. Within 6 to 9 months, Alphabet and Amazon unveiled their competing AI suites, bringing the valuation ratios back into historical alignment.'
  },
  AMZN: {
    groupName: 'Mega-Cap Cloud & Retail Ecosystem Peers',
    groupType: 'Hyperscale Cloud (AWS) & Digital Retail Logistics',
    keyPeers: ['MSFT', 'GOOGL', 'META', 'AAPL'],
    grandmaAnalogy: 'The world\'s biggest department store combined with the world\'s biggest digital warehouse (AWS).',
    whyInPlainEnglish: 'Amazon operates both the largest e-commerce logistics platform and the pioneer cloud infrastructure provider (AWS). It moves with Microsoft and Google because AWS and Azure dominate the cloud computing world.',
    sharedCustomers: 'Hundreds of millions of online shoppers and millions of enterprise companies hosting websites on AWS.',
    sharedSuppliers: 'Shipping fleets, warehouse logistics robots, and server hardware vendors.',
    whyPricesMoveTogether: 'Driven by consumer purchasing confidence and corporate cloud migration budgets, mirroring the trajectories of Apple, Microsoft, and Google.',
    famousDivergenceStory: 'In 2022, Amazon struggled with post-COVID warehouse overcapacity. As Andy Jassy restructured logistics regionalization and trimmed corporate costs, Amazon\'s operating margins surged in 2023-2024, snapping back to historical parity with Microsoft.'
  },
  AAPL: {
    groupName: 'Mega-Cap Hardware & Ecosystem Peers',
    groupType: 'Consumer Hardware & Services Ecosystem',
    keyPeers: ['MSFT', 'GOOGL', 'AMZN', 'META'],
    grandmaAnalogy: 'The luxury electronic jeweler. Everyone carries their phone, and its massive cash reserves make it an anchor of the entire stock market.',
    whyInPlainEnglish: 'Apple designs the iPhone, Mac, iPad, and collects high-margin subscription fees from the App Store and Apple Services. It is grouped with the other "Magnificent" tech titans because they represent the core of every retirement index fund.',
    sharedCustomers: 'Over 2.2 billion active consumer devices worldwide.',
    sharedSuppliers: 'TSMC for Apple Silicon processors, Sony for camera sensors, and Foxconn for final assembly.',
    whyPricesMoveTogether: 'Apple represents over 6% of the S&P 500. When institutional money enters or exits the US technology sector, Apple moves in tandem with Microsoft, Amazon, and Google.',
    famousDivergenceStory: 'In early 2024, Apple lagged behind the group due to reports of slower smartphone sales in China. However, at WWDC in June 2024, Apple revealed "Apple Intelligence," causing an immediate +25% rally that erased the entire multi-month lag.'
  },
  TSLA: {
    groupName: 'High-Beta Consumer & Autonomy Peers',
    groupType: 'Electric Mobility, Full Self-Driving & Energy Storage',
    keyPeers: ['NFLX', 'NVDA', 'RIVN'],
    grandmaAnalogy: 'The wild teenager of the tech group! It has the biggest dreams and moves much faster and with bigger swings than the older, calmer companies.',
    whyInPlainEnglish: 'Tesla combines electric vehicle manufacturing, autonomous driving AI, and energy storage. It is grouped with other high-growth, high-volatility tech innovators because its price is driven by future technological breakthroughs.',
    sharedCustomers: 'Global car buyers, clean energy homeowners, and commercial battery utility operators.',
    sharedSuppliers: 'Battery cell makers (Panasonic, CATL), steel/aluminum stamping suppliers, and specialized auto chipmakers.',
    whyPricesMoveTogether: 'Tesla has a "High Beta," meaning when tech stocks move up 1%, Tesla often moves up 2% or 3%. It shares strong co-movement with speculative growth and retail investor sentiment.',
    famousDivergenceStory: 'In early 2024, Tesla slashed vehicle prices to defend sales volume, causing auto profit margins to shrink from 24% to 16%. Tesla stock plunged -35% while the rest of the tech giants hit all-time highs. It eventually found a bottom and rallied back when autonomous Robotaxi plans were accelerated.'
  },
  NFLX: {
    groupName: 'High-Beta Streaming & Digital Media Peers',
    groupType: 'Subscription Video Entertainment & Ad Tier',
    keyPeers: ['DIS', 'META', 'AMZN', 'SPOT'],
    grandmaAnalogy: 'The living room TV champion. It competes with Disney and YouTube for your evening relaxation time.',
    whyInPlainEnglish: 'Netflix is the world leader in streaming subscription television and films. It is grouped with digital media, communication services, and high-beta tech because its valuation depends on subscriber growth and monthly pricing power.',
    sharedCustomers: 'Over 280 million global households subscribing to streaming entertainment.',
    sharedSuppliers: 'Hollywood production studios, writers, directors, and cloud hosting infrastructure (hosted on Amazon AWS).',
    whyPricesMoveTogether: 'Moves with broader consumer discretionary spending and online media engagement alongside Meta, Amazon, and Disney.',
    famousDivergenceStory: 'In early 2022, Netflix lost 200,000 subscribers and plummeted -70%. Management then cracked down on password sharing and launched a lower-priced ad tier. This internal operational fix produced record revenue, causing the stock to surge +200% from its lows and rejoin the top echelon of consumer tech.'
  }
};

export const PeerGroupingExplainerTab: React.FC<PeerGroupingExplainerTabProps> = ({
  selectedStock,
  onSelectStock,
  availableTickers,
  theme = 'dark'
}) => {
  const [activeStock, setActiveStock] = useState<string>(selectedStock || 'NVDA');

  const explanation = PEER_GROUP_EXPLANATIONS[activeStock] || {
    groupName: 'Comparable Technology & Growth Peers',
    groupType: 'Industry Sector Peer Group',
    keyPeers: availableTickers.filter(t => t !== activeStock).slice(0, 4),
    grandmaAnalogy: 'Companies that fish in the exact same economic pond and face the same weather conditions.',
    whyInPlainEnglish: `${activeStock} is grouped with other large-cap technology companies because they share similar macroeconomic drivers, corporate customer budgets, and capital market sensitivity.`,
    sharedCustomers: 'Enterprise commercial customers and global digital consumers.',
    sharedSuppliers: 'Semiconductor manufacturers, cloud service providers, and global component supply chains.',
    whyPricesMoveTogether: 'When industry demand expands, their revenues rise together. When interest rates or regulations change, their valuation multiples react in unison.',
    famousDivergenceStory: 'Historical deviations occur primarily around quarterly earnings announcements when one company beats expectations while others temporarily lag, before mean-reverting.'
  };

  const profile = STOCK_PROFILES[activeStock];
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Intro Header Banner */}
      <div className={`p-4 sm:p-5 rounded-xl border shadow-xl ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <h2 className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Why Are These Stocks Grouped Together?
              </h2>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                Peer Group Economic Logic
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Stocks aren't grouped randomly. They are grouped because they share real-world microchip factories, common enterprise customers, and identical economic tailwinds.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start md:self-auto">
            <GrandmaTooltip
              title="Why Stocks Are Grouped"
              theme={theme}
            >
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Plain English Explainer</span>
              </span>
            </GrandmaTooltip>
          </div>
        </div>

        {/* Stock Selector Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-wrap items-center gap-1.5">
          <span className={`text-xs font-semibold uppercase mr-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Explain Stock:
          </span>
          {availableTickers.map(ticker => {
            const isTarget = ticker === activeStock;
            return (
              <button
                key={ticker}
                onClick={() => {
                  setActiveStock(ticker);
                  onSelectStock(ticker);
                }}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  isTarget
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400/50 font-bold scale-105'
                    : isDark
                    ? 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <span>{ticker}</span>
                {isTarget && <span className="text-[10px] bg-slate-950 text-emerald-400 px-1 rounded">Target</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stock Explanation Card */}
      <div className={`p-5 sm:p-6 rounded-xl border shadow-xl space-y-6 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xl font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-lg">
                {activeStock}
              </span>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile?.name || activeStock}
                </h3>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {profile?.industry} · {profile?.sector}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Assigned Cohort:</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
              {explanation.groupName}
            </span>
          </div>
        </div>

        {/* 1. Grandma's Relatable Analogy */}
        <div className={`p-4 rounded-xl border leading-relaxed ${
          isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-200/90' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>👵 The Grandmother-Friendly Analogy:</span>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            "{explanation.grandmaAnalogy}"
          </p>
        </div>

        {/* 2. Core Economic Logic Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Why Grouped Together in Plain English */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              <Users className="w-4 h-4 text-cyan-400" />
              1. Why They Are in the Same Group
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {explanation.whyInPlainEnglish}
            </p>
          </div>

          {/* Why Their Prices Move Together */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              2. Why Their Prices Move Together
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {explanation.whyPricesMoveTogether}
            </p>
          </div>

          {/* Shared Customers */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              <Link className="w-4 h-4 text-indigo-400" />
              3. Shared Customer Base
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {explanation.sharedCustomers}
            </p>
          </div>

          {/* Shared Supply Chains */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              <Cpu className="w-4 h-4 text-purple-400" />
              4. Shared Supply Chain & Factories
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {explanation.sharedSuppliers}
            </p>
          </div>
        </div>

        {/* 3. Famous Story When It Deviated & Snapped Back */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-amber-300' : 'text-amber-800'
            }`}>
              Historical Moment: When {activeStock} Broke Away & Snapped Back (Mean Reversion)
            </h4>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {explanation.famousDivergenceStory}
          </p>
        </div>

        {/* Group Peer Badges */}
        <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Immediate Peer Companions:</span>
            <div className="flex items-center gap-1.5 font-mono">
              {explanation.keyPeers.map(peer => (
                <button
                  key={peer}
                  onClick={() => {
                    setActiveStock(peer);
                    onSelectStock(peer);
                  }}
                  className={`px-2 py-0.5 rounded border text-xs font-bold transition-colors ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-cyan-300 hover:border-slate-700'
                      : 'bg-slate-100 border-slate-200 text-cyan-700 hover:bg-slate-200'
                  }`}
                >
                  {peer}
                </button>
              ))}
            </div>
          </div>

          <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Historical Correlation Range: ρ = 0.65 to 0.88
          </div>
        </div>
      </div>
    </div>
  );
};
