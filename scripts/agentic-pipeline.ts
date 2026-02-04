#!/usr/bin/env npx tsx
/**
 * Agentic Pipeline for Polymarket BTC Dashboard (Local Fallback)
 * 
 * PRIMARY: Use Cursor Background Agent via GitHub Actions (twice daily)
 * FALLBACK: This script for local testing or when Cursor API unavailable
 * 
 * This script orchestrates:
 * 1. Fetching Polymarket BTC data via Gamma API
 * 2. Creating/updating JSON data file
 * 3. Validating data accuracy and chart logic
 * 4. Self-verification loop until error-free
 * 
 * Uses Claude API for intelligent orchestration and self-healing.
 * 
 * Usage:
 *   npm run pipeline                         # Run full pipeline locally
 *   ANTHROPIC_API_KEY=xxx npm run pipeline   # With inline key
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file if present
const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

function loadEnv(filePath: string): void {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv(envPath);
loadEnv(envLocalPath);

// Validate API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not set. Add it to .env or .env.local');
  process.exit(1);
}

// Types
interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  volume?: number;
  liquidity?: number;
  markets?: PolymarketMarket[];
}

interface PolymarketMarket {
  id: string;
  question: string;
  outcomes?: string[];
  outcomePrices?: string[];
  volume?: number;
  liquidity?: number;
}

interface PipelineState {
  iteration: number;
  maxIterations: number;
  dataFetched: boolean;
  jsonCreated: boolean;
  dashboardValid: boolean;
  errors: string[];
  warnings: string[];
  data: PolymarketBTCData | null;
}

interface PolymarketBTCData {
  metadata: {
    source: string;
    fetchedAt: string;
    asset: string;
    totalMarketsFound: number;
    totalBTCVolume: string;
    pipelineVersion: string;
  };
  summary: {
    totalMarkets: number;
    priceMarketsVolume: string;
    corporateMarketsVolume: string;
    tradeSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    buyRatio: number;
    sellRatio: number;
    buySellRatio: number;
  };
  markets: {
    priceTargets: PriceTargetMarket | null;
    weeklyPriceTargets: WeeklyPriceTargetMarket | null;
    corporate: CorporateMarkets | null;
    raceMarkets: RaceMarket[] | null;
  };
  aiInsights?: {
    summary: string;
    keyObservations: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

interface PriceTargetMarket {
  marketName: string;
  totalVolume: number;
  endDate: string;
  outcomes: {
    active: {
      upTargets: PriceTarget[];
      downTargets: PriceTarget[];
    };
  };
}

interface WeeklyPriceTargetMarket {
  marketName: string;
  totalVolume: number;
  endDate: string;
  outcomes: {
    upTargets: PriceTarget[];
    downTargets: PriceTarget[];
  };
}

interface PriceTarget {
  target: string;
  probability: number;
  volume: number;
  direction?: 'up' | 'down';
}

interface CorporateMarkets {
  microstrategy?: {
    buyMarkets?: Array<{
      date: string;
      probability: number;
      volume: number;
    }>;
  };
}

interface RaceMarket {
  marketName: string;
  volume: number;
  outcomes: {
    option1: { target: string; probability: number };
    option2: { target: string; probability: number };
  };
}

// Initialize Anthropic client
const anthropic = new Anthropic();

// Tool definitions for Claude
const tools: Anthropic.Tool[] = [
  {
    name: 'search_polymarket_btc',
    description: 'Search Polymarket for Bitcoin-related prediction markets. Returns active markets with prices, volumes, and outcomes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "Bitcoin", "BTC price", "Bitcoin 2026")',
        },
        limit: {
          type: 'number',
          description: 'Number of results to fetch (default: 50)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_polymarket_by_category',
    description: 'Get Polymarket events filtered by category tag (e.g., crypto, bitcoin)',
    input_schema: {
      type: 'object' as const,
      properties: {
        tag_id: {
          type: 'string',
          description: 'Category tag ID to filter by',
        },
        limit: {
          type: 'number',
          description: 'Number of results (default: 50)',
        },
      },
      required: ['tag_id'],
    },
  },
  {
    name: 'save_btc_data_json',
    description: 'Save the processed BTC market data to JSON file',
    input_schema: {
      type: 'object' as const,
      properties: {
        data: {
          type: 'object',
          description: 'The PolymarketBTCData object to save',
        },
      },
      required: ['data'],
    },
  },
  {
    name: 'validate_dashboard_data',
    description: 'Validate that the JSON data is correctly structured for the dashboard charts',
    input_schema: {
      type: 'object' as const,
      properties: {
        data: {
          type: 'object',
          description: 'The data to validate',
        },
      },
      required: ['data'],
    },
  },
  {
    name: 'report_status',
    description: 'Report current pipeline status and any errors/warnings',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          enum: ['success', 'error', 'warning', 'in_progress'],
        },
        message: {
          type: 'string',
        },
        errors: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['status', 'message'],
    },
  },
];

// Polymarket Gamma API client
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

async function fetchPolymarketBTCData(query: string, limit: number = 50): Promise<PolymarketEvent[]> {
  try {
    const url = new URL(`${GAMMA_API_BASE}/events`);
    url.searchParams.set('title_contains', query);
    url.searchParams.set('active', 'true');
    url.searchParams.set('closed', 'false');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('order', 'volume');
    url.searchParams.set('ascending', 'false');

    console.log(`[FETCH] Querying Polymarket: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AwesomeDashboard/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`);
    }

    const events = await response.json() as PolymarketEvent[];
    console.log(`[FETCH] Found ${events.length} events for query "${query}"`);
    return events;
  } catch (error) {
    console.error('[FETCH] Error fetching from Polymarket:', error);
    throw error;
  }
}

async function fetchByTag(tagId: string, limit: number = 50): Promise<PolymarketEvent[]> {
  try {
    const url = new URL(`${GAMMA_API_BASE}/events`);
    url.searchParams.set('tag_id', tagId);
    url.searchParams.set('active', 'true');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('order', 'volume');
    url.searchParams.set('ascending', 'false');

    console.log(`[FETCH] Querying by tag: ${tagId}`);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    return await response.json() as PolymarketEvent[];
  } catch (error) {
    console.error('[FETCH] Error fetching by tag:', error);
    throw error;
  }
}

function validateData(data: unknown): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const d = data as PolymarketBTCData;

  // Check required structure
  if (!d.metadata) errors.push('Missing metadata object');
  if (!d.summary) errors.push('Missing summary object');
  if (!d.markets) errors.push('Missing markets object');

  // Validate metadata
  if (d.metadata) {
    if (!d.metadata.fetchedAt) errors.push('Missing fetchedAt timestamp');
    if (!d.metadata.totalMarketsFound && d.metadata.totalMarketsFound !== 0) {
      errors.push('Missing totalMarketsFound');
    }
  }

  // Validate summary
  if (d.summary) {
    if (typeof d.summary.buyRatio !== 'number') errors.push('Invalid buyRatio');
    if (typeof d.summary.sellRatio !== 'number') errors.push('Invalid sellRatio');
    if (d.summary.buyRatio + d.summary.sellRatio > 101) {
      warnings.push('Buy + Sell ratio exceeds 100%');
    }
    if (!['BULLISH', 'BEARISH', 'NEUTRAL'].includes(d.summary.tradeSentiment)) {
      errors.push('Invalid tradeSentiment value');
    }
  }

  // Validate markets structure for charts
  if (d.markets?.priceTargets) {
    const pt = d.markets.priceTargets;
    if (!pt.outcomes?.active?.upTargets) warnings.push('No upTargets for price chart');
    if (!pt.outcomes?.active?.downTargets) warnings.push('No downTargets for price chart');
    
    // Check probabilities are valid percentages
    pt.outcomes?.active?.upTargets?.forEach((t, i) => {
      if (t.probability < 0 || t.probability > 100) {
        errors.push(`Invalid probability ${t.probability} for upTarget[${i}]`);
      }
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

function saveDataToJson(data: PolymarketBTCData): string {
  const filePath = path.join(process.cwd(), 'polymarket_btc_data.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`[SAVE] Data written to ${filePath}`);
  return filePath;
}

// Tool execution handler
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  console.log(`[TOOL] Executing: ${toolName}`, JSON.stringify(toolInput).slice(0, 200));

  switch (toolName) {
    case 'search_polymarket_btc': {
      const query = toolInput.query as string;
      const limit = (toolInput.limit as number) || 50;
      const events = await fetchPolymarketBTCData(query, limit);
      return JSON.stringify({ success: true, count: events.length, events });
    }

    case 'get_polymarket_by_category': {
      const tagId = toolInput.tag_id as string;
      const limit = (toolInput.limit as number) || 50;
      const events = await fetchByTag(tagId, limit);
      return JSON.stringify({ success: true, count: events.length, events });
    }

    case 'save_btc_data_json': {
      const data = toolInput.data as PolymarketBTCData;
      const filePath = saveDataToJson(data);
      return JSON.stringify({ success: true, filePath });
    }

    case 'validate_dashboard_data': {
      const data = toolInput.data;
      const validation = validateData(data);
      return JSON.stringify(validation);
    }

    case 'report_status': {
      const status = toolInput as { status: string; message: string; errors?: string[] };
      console.log(`[STATUS] ${status.status.toUpperCase()}: ${status.message}`);
      if (status.errors?.length) {
        console.log('[ERRORS]', status.errors.join(', '));
      }
      return JSON.stringify({ acknowledged: true });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// Main agentic loop
async function runAgenticPipeline(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 AGENTIC POLYMARKET BTC PIPELINE');
  console.log('='.repeat(60) + '\n');

  const systemPrompt = `You are an autonomous data pipeline agent responsible for fetching, processing, and validating Polymarket BTC prediction market data.

Your task is to:
1. Fetch all Bitcoin-related markets from Polymarket
2. Process the raw data into a structured JSON format suitable for dashboard visualization
3. Validate the data structure and values
4. Fix any errors and re-validate until the data is correct
5. Save the final validated data

IMPORTANT DATA STRUCTURE:
The output JSON must match this structure for the React dashboard:
{
  "metadata": {
    "source": "Polymarket via Agentic Pipeline",
    "fetchedAt": "<ISO timestamp>",
    "asset": "Bitcoin (BTC)",
    "totalMarketsFound": <number>,
    "totalBTCVolume": "<formatted string like $27.8M>",
    "pipelineVersion": "2.0.0"
  },
  "summary": {
    "totalMarkets": <number>,
    "priceMarketsVolume": "<formatted>",
    "corporateMarketsVolume": "<formatted>",
    "tradeSentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
    "buyRatio": <0-100>,
    "sellRatio": <0-100>,
    "buySellRatio": <ratio>
  },
  "markets": {
    "priceTargets": {
      "marketName": "<string>",
      "totalVolume": <number>,
      "endDate": "<YYYY-MM-DD>",
      "outcomes": {
        "active": {
          "upTargets": [{ "target": "↑ $X", "probability": <0-100>, "volume": <number>, "direction": "up" }],
          "downTargets": [{ "target": "↓ $X", "probability": <0-100>, "volume": <number>, "direction": "down" }]
        }
      }
    },
    "weeklyPriceTargets": { ... },
    "corporate": { ... },
    "raceMarkets": [...]
  },
  "aiInsights": {
    "summary": "<2-3 sentence market summary>",
    "keyObservations": ["<observation 1>", "<observation 2>", ...],
    "riskLevel": "LOW" | "MEDIUM" | "HIGH"
  }
}

CHART REQUIREMENTS:
- PriceTargetChart needs upTargets and downTargets with probability as percentage (0-100)
- SentimentGauge needs buyRatio and sellRatio that sum to ~100
- VolumeBreakdownChart needs category, volume, percentage
- All prices should be formatted with $ and commas

SELF-VERIFICATION:
After creating the data, use validate_dashboard_data to check it. If there are errors, fix them and validate again. Continue until validation passes.

Current date: ${new Date().toISOString()}`;

  const userPrompt = `Execute the full pipeline:

1. First, search for "Bitcoin" and "BTC" markets on Polymarket to get all relevant data
2. Process the raw events into the structured JSON format described above
3. Calculate sentiment based on market probabilities (>50% for higher prices = BULLISH)
4. Generate AI insights summarizing the market state
5. Validate the data structure
6. If validation fails, fix the issues and re-validate
7. Once valid, save the JSON file
8. Report final status

Begin the pipeline now.`;

  let messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userPrompt },
  ];

  let iteration = 0;
  const maxIterations = 10;

  while (iteration < maxIterations) {
    iteration++;
    console.log(`\n--- Iteration ${iteration}/${maxIterations} ---\n`);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt,
        tools,
        messages,
      });

      console.log(`[CLAUDE] Stop reason: ${response.stop_reason}`);

      // Process response content
      const assistantContent: Anthropic.ContentBlock[] = [];
      let hasToolUse = false;

      for (const block of response.content) {
        assistantContent.push(block);
        
        if (block.type === 'text') {
          console.log(`[CLAUDE] ${block.text.slice(0, 500)}${block.text.length > 500 ? '...' : ''}`);
        }
        
        if (block.type === 'tool_use') {
          hasToolUse = true;
        }
      }

      // Add assistant response to messages
      messages.push({ role: 'assistant', content: assistantContent });

      // If no tool use, we're done
      if (!hasToolUse || response.stop_reason === 'end_turn') {
        console.log('\n✅ Pipeline completed');
        break;
      }

      // Execute tool calls
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log(`\n[TOOL CALL] ${block.name}`);
          const result = await executeTool(block.name, block.input as Record<string, unknown>);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      // Add tool results to messages
      messages.push({ role: 'user', content: toolResults });

    } catch (error) {
      console.error(`[ERROR] Iteration ${iteration} failed:`, error);
      
      if (iteration >= maxIterations) {
        throw new Error(`Pipeline failed after ${maxIterations} iterations`);
      }
      
      // Add error to conversation for self-healing
      messages.push({
        role: 'user',
        content: `Error occurred: ${error instanceof Error ? error.message : String(error)}. Please diagnose and fix the issue.`,
      });
    }
  }

  if (iteration >= maxIterations) {
    console.error('❌ Max iterations reached without completion');
    process.exit(1);
  }
}

// Run pipeline
runAgenticPipeline()
  .then(() => {
    console.log('\n🎉 Agentic pipeline finished successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Pipeline failed:', error);
    process.exit(1);
  });
