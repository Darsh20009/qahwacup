import { useEffect, useRef, useState, useCallback } from "react";

type WSClientType = "kitchen" | "display" | "order-tracking" | "pos";

interface WSMessage {
  type: string;
  order?: any;
  timestamp?: number;
  [key: string]: any;
}

interface UseOrderWebSocketOptions {
  clientType: WSClientType;
  orderId?: string;
  branchId?: string;
  onNewOrder?: (order: any) => void;
  onOrderUpdated?: (order: any) => void;
  onOrderReady?: (order: any) => void;
  enabled?: boolean;
}

export function useOrderWebSocket({
  clientType,
  orderId,
  branchId,
  onNewOrder,
  onOrderUpdated,
  onOrderReady,
  enabled = true,
}: UseOrderWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearTimers = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendSubscribe = useCallback((ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          clientType,
          orderId,
          branchId,
        })
      );
    }
  }, [clientType, orderId, branchId]);

  const connect = useCallback(() => {
    if (!enabled || !isMountedRef.current) return;
    if (isConnectingRef.current) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    clearTimers();
    isConnectingRef.current = true;

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState !== WebSocket.CLOSED && 
            wsRef.current.readyState !== WebSocket.CLOSING) {
          wsRef.current.close(1000, "Reconnecting");
        }
      } catch (e) {
      }
      wsRef.current = null;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/orders`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        console.log("[WS] Connected to orders WebSocket");
        isConnectingRef.current = false;
        setIsConnected(true);

        sendSubscribe(ws);

        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          } else {
            clearTimers();
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const message: WSMessage = JSON.parse(event.data);
          setLastMessage(message);

          switch (message.type) {
            case "new_order":
              onNewOrder?.(message.order);
              break;
            case "order_updated":
              onOrderUpdated?.(message.order);
              break;
            case "order_ready":
              onOrderReady?.(message.order);
              break;
            case "welcome":
              sendSubscribe(ws);
              break;
          }
        } catch (error) {
          console.error("[WS] Error parsing message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("[WS] Connection closed:", event.code, event.reason);
        isConnectingRef.current = false;
        setIsConnected(false);
        clearTimers();

        if (isMountedRef.current && enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("[WS] WebSocket error:", error);
        setError("خطأ في الاتصال - جاري إعادة المحاولة");
        setIsConnected(false);
        isConnectingRef.current = false;
      };
    } catch (error) {
      console.error("[WS] Failed to create WebSocket:", error);
      isConnectingRef.current = false;

      if (isMountedRef.current && enabled) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    }
  }, [enabled, clearTimers, sendSubscribe, onNewOrder, onOrderUpdated, onOrderReady]);

  const disconnect = useCallback(() => {
    clearTimers();
    isConnectingRef.current = false;
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState !== WebSocket.CLOSED && 
            wsRef.current.readyState !== WebSocket.CLOSING) {
          wsRef.current.close(1000, "Disconnecting");
        }
      } catch (e) {
      }
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [clearTimers]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();
    
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    reconnect: connect,
    disconnect,
  };
}
