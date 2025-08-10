import React, { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// WebSocket hook for real-time updates
export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types for real-time updates
        switch (data.type) {
          case 'analytics_update':
            // Invalidate analytics queries to fetch fresh data
            queryClient.invalidateQueries({ queryKey: ['/api/analytics/realtime'] });
            break;
          
          case 'credit_update':
            // Update credit balance in real-time
            queryClient.invalidateQueries({ queryKey: ['/api/credits/balance'] });
            queryClient.invalidateQueries({ queryKey: ['/api/credits/transactions'] });
            break;
            
          case 'payment_update':
            // Update payment-related data
            queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
            break;

          case 'user_update':
            // Update user data
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            break;

          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }, [queryClient]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Subscribe to specific analytics updates
  const subscribeToAnalytics = useCallback((storyId: string) => {
    sendMessage({
      type: 'subscribe_analytics',
      storyId
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    subscribeToAnalytics,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
}

// React component to automatically handle WebSocket connection
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSocket();
  return React.createElement(React.Fragment, null, children);
}