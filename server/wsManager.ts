import WebSocket from 'ws';

let wss: WebSocket.Server;

export const setWss = (server: WebSocket.Server) => {
  wss = server;
};

export const getWss = () => {
  if (!wss) throw new Error('WebSocket server is not initialized');
  return wss;
};
