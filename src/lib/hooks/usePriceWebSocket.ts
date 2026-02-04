/**
 * WebSocket Hook for Real-time Price Updates
 * Connects to Polymarket CLOB WebSocket for live price data
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PriceUpdate {
  tokenId: string;
  price: number;
  timestamp: number;
}

interface WebSocketMessage {
  event_type?: string;
  asset_id?: string;
  price?: string;
  market?: string;
  timestamp?: string;
}

interface UsePriceWebSocketOptions {
  enabled?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

interface UsePriceWebSocketReturn {
  prices: Map<string, number>;
  connected: boolean;
  error: string | null;
  lastUpdate: number | null;
  reconnect: () => void;
}

const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/';

/**
 * Hook for WebSocket price updates
 */
export function usePriceWebSocket(
  tokenIds: string[],
  options: UsePriceWebSocketOptions = {}
): UsePriceWebSocketReturn {
  const {
    enabled = true,
    reconnectDelay = 5000,
    maxReconnectAttempts = 5,
  } = options;
  
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const connect = useCallback(() => {
    if (!enabled || tokenIds.length === 0) return;
    
    // Don't reconnect if we've exceeded max attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setError(`Max reconnection attempts (${maxReconnectAttempts}) exceeded`);
      return;
    }
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to markets
        ws.send(JSON.stringify({
          type: 'MARKET',
          assets_ids: tokenIds,
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Handle price updates
          if (data.event_type === 'price_change' && data.asset_id && data.price) {
            const price = parseFloat(data.price);
            
            setPrices((prev) => {
              const next = new Map(prev);
              next.set(data.asset_id!, price);
              return next;
            });
            
            setLastUpdate(Date.now());
          }
        } catch (parseError) {
          console.warn('[WebSocket] Failed to parse message:', parseError);
        }
      };
      
      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setError('WebSocket connection error');
      };
      
      ws.onclose = (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        setConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`[WebSocket] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };
    } catch (connectError) {
      console.error('[WebSocket] Connection failed:', connectError);
      setError('Failed to connect to WebSocket');
    }
  }, [enabled, tokenIds, reconnectDelay, maxReconnectAttempts]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnected(false);
  }, []);
  
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    connect();
  }, [connect, disconnect]);
  
  // Connect on mount/token change
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  // Update subscription when tokenIds change
  useEffect(() => {
    if (connected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        operation: 'subscribe',
        assets_ids: tokenIds,
      }));
    }
  }, [tokenIds, connected]);
  
  return {
    prices,
    connected,
    error,
    lastUpdate,
    reconnect,
  };
}

/**
 * Hook for WebSocket connection status only
 */
export function useWebSocketStatus(): {
  isSupported: boolean;
  isEnabled: boolean;
} {
  const isSupported = typeof WebSocket !== 'undefined';
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET !== 'false';
  
  return { isSupported, isEnabled };
}

/**
 * Format price update for display
 */
export function formatPriceUpdate(update: PriceUpdate): string {
  return `$${update.price.toFixed(2)} (${new Date(update.timestamp).toLocaleTimeString()})`;
}
