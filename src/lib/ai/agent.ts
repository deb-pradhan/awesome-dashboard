/**
 * AI Agent
 * OpenAI GPT-4 integration for dynamic market insights
 */

import OpenAI from 'openai';
import type { PolymarketData } from '../types';
import type { SignificantChangeEvent } from '../polymarket/change-detector';
import { buildSystemPrompt, buildAnalysisPrompt } from './prompts';

// AI Insights output type
export interface AIInsights {
  generatedAt: string;
  triggeredBy: SignificantChangeEvent | null;
  keyObservations: string[];
  tradingInsight: {
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    rationale: string;
    recommendation: string;
    suggestedStrategies: string[];
  };
  riskAssessment: {
    corporateRisk: { level: string; explanation: string };
    governmentRisk: { level: string; explanation: string };
  };
  confidence: number;
}

// Default insights when AI is unavailable
const DEFAULT_INSIGHTS: AIInsights = {
  generatedAt: new Date().toISOString(),
  triggeredBy: null,
  keyObservations: [
    'AI insights temporarily unavailable',
    'Using cached market data',
    'Manual analysis recommended',
  ],
  tradingInsight: {
    sentiment: 'NEUTRAL',
    rationale: 'Unable to generate AI analysis at this time.',
    recommendation: 'Review market data manually and monitor for changes.',
    suggestedStrategies: ['Monitor price action', 'Wait for AI insights to restore'],
  },
  riskAssessment: {
    corporateRisk: { level: 'UNKNOWN', explanation: 'AI analysis unavailable' },
    governmentRisk: { level: 'UNKNOWN', explanation: 'AI analysis unavailable' },
  },
  confidence: 0,
};

/**
 * Initialize OpenAI client
 */
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('[AIAgent] OPENAI_API_KEY not configured');
    return null;
  }
  
  return new OpenAI({ apiKey });
}

/**
 * Generate AI insights from market data
 */
export async function generateInsights(
  data: PolymarketData,
  change: SignificantChangeEvent | null
): Promise<AIInsights> {
  const client = getOpenAIClient();
  
  if (!client) {
    return {
      ...DEFAULT_INSIGHTS,
      generatedAt: new Date().toISOString(),
      triggeredBy: change,
    };
  }
  
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildAnalysisPrompt(data, change) },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    const parsed = JSON.parse(content);
    
    return {
      generatedAt: new Date().toISOString(),
      triggeredBy: change,
      keyObservations: parsed.keyObservations || DEFAULT_INSIGHTS.keyObservations,
      tradingInsight: {
        sentiment: parsed.tradingInsight?.sentiment || 'NEUTRAL',
        rationale: parsed.tradingInsight?.rationale || '',
        recommendation: parsed.tradingInsight?.recommendation || '',
        suggestedStrategies: parsed.tradingInsight?.suggestedStrategies || [],
      },
      riskAssessment: {
        corporateRisk: parsed.riskAssessment?.corporateRisk || { level: 'UNKNOWN', explanation: '' },
        governmentRisk: parsed.riskAssessment?.governmentRisk || { level: 'UNKNOWN', explanation: '' },
      },
      confidence: parsed.confidence || 0.8,
    };
  } catch (error) {
    console.error('[AIAgent] Error generating insights:', error);
    
    return {
      ...DEFAULT_INSIGHTS,
      generatedAt: new Date().toISOString(),
      triggeredBy: change,
    };
  }
}

/**
 * Generate insights only if feature is enabled
 */
export async function generateInsightsIfEnabled(
  data: PolymarketData,
  change: SignificantChangeEvent | null
): Promise<AIInsights | null> {
  const enabled = process.env.ENABLE_AI_INSIGHTS !== 'false';
  
  if (!enabled) {
    console.log('[AIAgent] AI insights disabled');
    return null;
  }
  
  return generateInsights(data, change);
}

/**
 * Merge AI insights into PolymarketData
 */
export function mergeInsightsIntoData(
  data: PolymarketData,
  insights: AIInsights | null
): PolymarketData {
  if (!insights) return data;
  
  return {
    ...data,
    analysis: {
      ...data.analysis,
      keyObservations: insights.keyObservations,
      tradingInsight: {
        ...data.analysis.tradingInsight,
        sentiment: insights.tradingInsight.sentiment,
        rationale: insights.tradingInsight.rationale,
        recommendation: insights.tradingInsight.recommendation,
        keyObservations: insights.keyObservations,
        suggestedStrategies: insights.tradingInsight.suggestedStrategies,
      },
    },
  };
}

export { DEFAULT_INSIGHTS };
