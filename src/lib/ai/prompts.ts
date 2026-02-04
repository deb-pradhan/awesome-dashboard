/**
 * AI Prompt Templates
 * Structured prompts for OpenAI GPT-4 insight generation
 */

import type { PolymarketData } from '../types';
import type { SignificantChangeEvent } from '../polymarket/change-detector';

/**
 * Build the system prompt for the AI agent
 */
export function buildSystemPrompt(): string {
  return `You are a senior crypto market analyst specializing in Bitcoin prediction markets. Your role is to:

1. Analyze Polymarket data and extract actionable insights
2. Identify key market trends and sentiment shifts
3. Provide clear, data-driven observations
4. Offer trading recommendations based on market probabilities

Always respond with valid JSON matching the specified schema. Be concise but thorough.
Focus on the most significant data points and avoid generic statements.`;
}

/**
 * Build the user prompt with market data
 */
export function buildAnalysisPrompt(
  data: PolymarketData,
  change: SignificantChangeEvent | null
): string {
  const triggerContext = change
    ? `
TRIGGERED BY: ${change.type}
- Previous: ${change.previous}
- Current: ${change.current}
- Change: ${change.percentChange.toFixed(2)}%
- Description: ${change.description}
`
    : 'TRIGGERED BY: Scheduled refresh';

  return `Analyze this Polymarket Bitcoin data and generate insights.

CURRENT MARKET STATE:
- BTC Price: $${data.analysis.priceConsensus.currentPrice.toLocaleString()}
- Sentiment: ${data.summary.tradeSentiment} (${data.summary.buySellRatio.toFixed(2)}:1 buy/sell ratio)
- Buy Orders: ${data.tradeFlow.recentActivity.buyOrders}
- Sell Orders: ${data.tradeFlow.recentActivity.sellOrders}
- Total Volume: ${data.metadata.totalBTCVolume}
- Markets Tracked: ${data.metadata.totalMarketsFound}

${triggerContext}

TOP PRICE TARGETS:
Upside:
- ${data.analysis.priceConsensus.mostLikelyUp.target}: ${data.analysis.priceConsensus.mostLikelyUp.probability}%
${data.markets.priceTargets.outcomes.active.upTargets.slice(0, 5).map(t => `- ${t.target}: ${t.probability.toFixed(1)}%`).join('\n')}

Downside:
- ${data.analysis.priceConsensus.mostLikelyDown.target}: ${data.analysis.priceConsensus.mostLikelyDown.probability}%
${data.markets.priceTargets.outcomes.active.downTargets.slice(0, 3).map(t => `- ${t.target}: ${t.probability.toFixed(1)}%`).join('\n')}

CORPORATE RISK (MicroStrategy):
- Sells Bitcoin by EOY 2025: ${data.markets.corporate.microstrategy.sellsByDate.outcomes[0]?.probability || 'N/A'}%
- Forced Liquidation: ${data.markets.corporate.microstrategy.forcedLiquidation.probability || 'N/A'}%

GOVERNMENT MARKETS:
- US National Reserve: ${data.markets.government.usNationalReserve.probability || 'N/A'}%
- Texas Reserve Act: ${data.markets.government.texasReserve.probability || 'N/A'}%

Generate a JSON response with this exact structure:
{
  "keyObservations": [
    "5-7 bullet points that are data-driven and actionable",
    "Include specific numbers and percentages",
    "Reference the trigger event if applicable"
  ],
  "tradingInsight": {
    "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
    "rationale": "2-3 sentences explaining the current market state based on the data",
    "recommendation": "1-2 sentences of specific, actionable advice",
    "suggestedStrategies": [
      "3-5 specific trading strategies based on current probabilities"
    ]
  },
  "riskAssessment": {
    "corporateRisk": {
      "level": "LOW" | "MEDIUM" | "HIGH",
      "explanation": "Brief explanation of MicroStrategy risk"
    },
    "governmentRisk": {
      "level": "LOW" | "MEDIUM" | "HIGH", 
      "explanation": "Brief explanation of government action probability"
    }
  },
  "confidence": 0.0 to 1.0
}`;
}

/**
 * Build a summary prompt for quick insights
 */
export function buildSummaryPrompt(data: PolymarketData): string {
  return `Provide a one-sentence market summary for Bitcoin based on:
- Price: $${data.analysis.priceConsensus.currentPrice.toLocaleString()}
- Sentiment: ${data.summary.tradeSentiment}
- Buy/Sell Ratio: ${data.summary.buySellRatio.toFixed(2)}:1
- Top Upside: ${data.analysis.priceConsensus.mostLikelyUp.target} (${data.analysis.priceConsensus.mostLikelyUp.probability}%)
- Top Downside: ${data.analysis.priceConsensus.mostLikelyDown.target} (${data.analysis.priceConsensus.mostLikelyDown.probability}%)

Respond with just the summary sentence, no JSON.`;
}
