/**
 * SWR Hooks for Polymarket Data
 * Client-side data fetching with stale-while-revalidate
 */

'use client';

import useSWR, { SWRConfiguration } from 'swr';
import type { PolymarketData } from '../types';
import type { AIInsights } from '../ai/agent';

// Default fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  
  return response.json();
};

// Price data type
interface PriceData {
  price: number;
  timestamp: number;
  source: string;
}

/**
 * Hook for main Polymarket data
 * Polls every 30 seconds
 */
export function usePolymarketData(config?: SWRConfiguration<PolymarketData>) {
  return useSWR<PolymarketData>(
    '/api/polymarket',
    fetcher,
    {
      refreshInterval: 30_000,        // Poll every 30 seconds
      revalidateOnFocus: true,        // Refresh on tab focus
      revalidateOnReconnect: true,    // Refresh on reconnect
      dedupingInterval: 5_000,        // Dedupe requests within 5 seconds
      errorRetryCount: 3,             // Retry 3 times on error
      errorRetryInterval: 5_000,      // Wait 5 seconds between retries
      ...config,
    }
  );
}

/**
 * Hook for BTC price data
 * Polls every 10 seconds for more frequent updates
 */
export function usePrices(config?: SWRConfiguration<PriceData>) {
  return useSWR<PriceData>(
    '/api/polymarket/prices',
    fetcher,
    {
      refreshInterval: 10_000,        // Poll every 10 seconds
      revalidateOnFocus: true,
      dedupingInterval: 2_000,        // Shorter dedup for prices
      ...config,
    }
  );
}

/**
 * Hook for AI-generated insights
 * Polls every 60 seconds (AI updates are less frequent)
 */
export function useAIInsights(config?: SWRConfiguration<AIInsights>) {
  return useSWR<AIInsights>(
    '/api/polymarket/insights',
    fetcher,
    {
      refreshInterval: 60_000,        // Poll every 60 seconds
      revalidateOnFocus: false,       // Don't refresh on focus (expensive)
      dedupingInterval: 30_000,       // Longer dedup for AI
      errorRetryCount: 2,             // Fewer retries for AI
      ...config,
    }
  );
}

/**
 * Combined hook that merges main data with AI insights
 */
export function useEnrichedPolymarketData(config?: SWRConfiguration<PolymarketData>) {
  const { data: mainData, error: mainError, isLoading: mainLoading, mutate } = usePolymarketData(config);
  const { data: insights, error: insightsError } = useAIInsights();
  
  // Merge AI insights into main data when both are available
  const enrichedData = mainData && insights ? {
    ...mainData,
    analysis: {
      ...mainData.analysis,
      keyObservations: insights.keyObservations || mainData.analysis.keyObservations,
      tradingInsight: {
        ...mainData.analysis.tradingInsight,
        sentiment: insights.tradingInsight?.sentiment || mainData.analysis.tradingInsight.sentiment,
        rationale: insights.tradingInsight?.rationale || mainData.analysis.tradingInsight.rationale,
        recommendation: insights.tradingInsight?.recommendation || mainData.analysis.tradingInsight.recommendation,
        keyObservations: insights.keyObservations || mainData.analysis.tradingInsight.keyObservations,
        suggestedStrategies: insights.tradingInsight?.suggestedStrategies || mainData.analysis.tradingInsight.suggestedStrategies,
      },
    },
  } : mainData;
  
  return {
    data: enrichedData,
    error: mainError || insightsError,
    isLoading: mainLoading,
    mutate,
    insights,
  };
}

/**
 * Hook to force refresh all data
 */
export function useRefresh() {
  const { mutate: mutateMain } = usePolymarketData();
  const { mutate: mutatePrices } = usePrices();
  const { mutate: mutateInsights } = useAIInsights();
  
  const refreshAll = async () => {
    await Promise.all([
      mutateMain(),
      mutatePrices(),
      mutateInsights(),
    ]);
  };
  
  const refreshInsights = async () => {
    // Force refresh by calling the API with refresh=true
    const response = await fetch('/api/polymarket/insights?refresh=true');
    const newInsights = await response.json();
    await mutateInsights(newInsights, false);
    return newInsights;
  };
  
  return {
    refreshAll,
    refreshInsights,
    refreshMain: mutateMain,
    refreshPrices: mutatePrices,
  };
}
