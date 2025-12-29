import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";

interface WSClient {
  ws: WebSocket;
  type: "kitchen" | "display" | "order-tracking" | "pos" | "inventory";
  orderId?: string;
  branchId?: string;
  lastPing: number;
  isAlive: boolean;
}

class OrderWebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, WSClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  setup(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws/orders" });

    this.wss.on("connection", (ws, req) => {
      console.log("[WS] New client connected");

      const client: WSClient = {
        ws,
        type: "display",
        lastPing: Date.now(),
        isAlive: true,
      };
      this.clients.set(ws, client);

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("[WS] Error parsing message:", error);
        }
      });

      ws.on("close", (code, reason) => {
        console.log(`[WS] Client disconnected: ${code} ${reason || ''}`);
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("[WS] Client error:", error.message);
        this.clients.delete(ws);
        try {
          ws.terminate();
        } catch (e) {}
      });

      ws.on("pong", () => {
        const client = this.clients.get(ws);
        if (client) {
          client.isAlive = true;
          client.lastPing = Date.now();
        }
      });

      ws.send(JSON.stringify({ type: "welcome", timestamp: Date.now() }));
    });

    this.startHeartbeat();
    console.log("✅ WebSocket server initialized at /ws/orders");
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const staleThreshold = 60000;

      this.clients.forEach((client, ws) => {
        if (!client.isAlive || (now - client.lastPing > staleThreshold)) {
          console.log("[WS] Terminating stale client");
          this.clients.delete(ws);
          try {
            ws.terminate();
          } catch (e) {}
          return;
        }

        client.isAlive = false;
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
          }
        } catch (e) {
          this.clients.delete(ws);
        }
      });
    }, 30000);
  }

  private handleMessage(ws: WebSocket, message: { type: string; [key: string]: any }) {
    const client = this.clients.get(ws);
    if (client) {
      client.lastPing = Date.now();
      client.isAlive = true;
    }

    switch (message.type) {
      case "subscribe":
        if (client) {
          client.type = message.clientType || "display";
          client.orderId = message.orderId;
          client.branchId = message.branchId;
        }
        console.log(`[WS] Client subscribed as ${message.clientType}`);
        ws.send(JSON.stringify({ type: "subscribed", clientType: message.clientType }));
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        break;

      default:
        break;
    }
  }

  private cleanupStaleClients() {
    this.clients.forEach((client, ws) => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.log("[WS] Removing closed connection");
        this.clients.delete(ws);
      }
    });
  }

  broadcastOrderUpdate(order: any) {
    if (!this.wss) return;
    this.cleanupStaleClients();

    const message = JSON.stringify({
      type: "order_updated",
      order,
      timestamp: Date.now(),
    });

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (
          client.type === "kitchen" ||
          client.type === "display" ||
          client.type === "pos" ||
          (client.type === "order-tracking" && client.orderId === order.id)
        ) {
          try {
            ws.send(message);
          } catch (e) {
            this.clients.delete(ws);
          }
        }
      }
    });
  }

  broadcastNewOrder(order: any) {
    if (!this.wss) return;
    this.cleanupStaleClients();

    const message = JSON.stringify({
      type: "new_order",
      order,
      timestamp: Date.now(),
    });

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (client.type === "kitchen" || client.type === "display" || client.type === "pos") {
          try {
            ws.send(message);
          } catch (e) {
            this.clients.delete(ws);
          }
        }
      }
    });
  }

  broadcastOrderReady(order: any) {
    if (!this.wss) return;
    this.cleanupStaleClients();

    const message = JSON.stringify({
      type: "order_ready",
      order,
      timestamp: Date.now(),
    });

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (
          client.type === "display" ||
          (client.type === "order-tracking" && client.orderId === order.id)
        ) {
          try {
            ws.send(message);
          } catch (e) {
            this.clients.delete(ws);
          }
        }
      }
    });
  }

  broadcastStockAlert(alert: any) {
    if (!this.wss) return;
    this.cleanupStaleClients();

    const message = JSON.stringify({
      type: "stock_alert",
      alert,
      timestamp: Date.now(),
    });

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (client.type === "inventory" || client.type === "display") {
          try {
            ws.send(message);
          } catch (e) {
            this.clients.delete(ws);
          }
        }
      }
    });
  }

  broadcastAlertResolved(alertId: string, branchId: string) {
    if (!this.wss) return;
    this.cleanupStaleClients();

    const message = JSON.stringify({
      type: "alert_resolved",
      alertId,
      branchId,
      timestamp: Date.now(),
    });

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (client.type === "inventory" || client.type === "display") {
          try {
            ws.send(message);
          } catch (e) {
            this.clients.delete(ws);
          }
        }
      }
    });
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.clients.forEach((client, ws) => {
      try {
        ws.close(1001, "Server shutting down");
      } catch (e) {}
    });
    this.clients.clear();
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const wsManager = new OrderWebSocketManager();
