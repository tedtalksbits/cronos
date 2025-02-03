//wsManager.ts

import WebSocket from 'ws';

let wss: WebSocket.Server;

export const setWss = (server: WebSocket.Server) => {
  wss = server;
};

export const getWss = () => {
  if (!wss) throw new Error('WebSocket server is not initialized');
  return wss;
};

export class WebSocketMessage {
  constructor(
    public message: string,
    public operation: 'invalidate' | 'log' | 'connection' | 'ping',
    public data: any
  ) {}

  public static fromJson(json: string): WebSocketMessage {
    const obj = JSON.parse(json);
    return new WebSocketMessage(obj.message, obj.operation, obj.data);
  }

  public toJson(): string {
    return JSON.stringify(this);
  }
}
