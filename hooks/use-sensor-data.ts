'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SensorData {
  mytime: string;
  sensor_keys: string[];
  latest: Record<string, number>;
  history: Record<string, Record<string, number>>;
  prediction: Record<string, any>;
  timestamp: string;
}

export const useSensorData = () => {
  const [data, setData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    
    const connect = () => {
      try {
        eventSource = new EventSource('/api/stream');
        setIsConnected(true);
        setError(null);

        eventSource.onmessage = (event) => {
          try {
            const newData = JSON.parse(event.data);
            setData(newData);
            setLastUpdate(new Date());
            setError(null);
          } catch (e) {
            console.error('[v0] Parse error:', e);
          }
        };

        eventSource.onerror = () => {
          console.error('[v0] Stream error');
          setIsConnected(false);
          setError('Connection lost. Reconnecting...');
          eventSource?.close();
          reconnectTimer = setTimeout(connect, 3000);
        };
      } catch (err) {
        console.error('[v0] Connection error:', err);
        setIsConnected(false);
        setError('Failed to connect');
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  const reconnect = useCallback(() => {
    setData(null);
    setError(null);
    setIsConnected(false);
    
    // Trigger reconnection by unmounting and remounting
    window.location.reload();
  }, []);

  return {
    data,
    error,
    isConnected,
    lastUpdate,
    reconnect,
  };
};
