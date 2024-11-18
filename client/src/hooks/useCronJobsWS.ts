// import React from 'react';

// const useReactQuerySubscription = () => {
//   React.useEffect(() => {
//     const websocket = new WebSocket('ws://localhost:3005?id=myidhere');
//     websocket.onopen = () => {
//       console.log('connected');
//     };
//     websocket.onmessage = (message) => {
//       console.log(message);
//     };

//     return () => {
//       websocket.close();
//     };
//   }, []);
// };

// export { useReactQuerySubscription };

// src/hooks/useWebSocket.ts
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef } from 'react';

type InvalidateEvent = {
  operation: 'invalidate';
  entity: Array<string>;
  id?: number;
};

type UpdateEvent = {
  operation: 'update';
  entity: Array<string>;
  id: number;
  payload: Record<string, unknown>;
};

type WebSocketState = {
  ws: WebSocket | null;
  isConnected: boolean;
};

type WebSocketEvent = InvalidateEvent | UpdateEvent;

export const useWebSocket = (url: string) => {
  const [wsState, setWsState] = React.useState<WebSocketState>({
    ws: null,
    isConnected: false,
  });
  const queryClient = useQueryClient();
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    websocket.current = new WebSocket(url);

    websocket.current.onmessage = (event) => {
      const data: WebSocketEvent = JSON.parse(event.data);
      switch (data.operation) {
        case 'invalidate':
          console.log('Invalidating query:', data);
          queryClient.invalidateQueries({
            queryKey: data.entity,
          });
          break;
        case 'update':
          queryClient.setQueryData(data.entity, (oldData: any) => {
            const update = (entity: Record<string, unknown>) =>
              entity.id === data.id ? { ...entity, ...data.payload } : entity;
            return Array.isArray(oldData)
              ? oldData.map(update)
              : update(oldData as Record<string, unknown>);
          });
          break;
        default:
          console.warn('Unknown WebSocket event:', data);
      }
    };

    websocket.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setWsState({ ws: websocket.current, isConnected: true });
    };

    websocket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsState({ ws: websocket.current, isConnected: false });
    };

    websocket.current.onclose = () => {
      console.log('WebSocket connection closed');
      setWsState({ ws: websocket.current, isConnected: false });
    };

    return () => {
      websocket.current?.close();
      setWsState({ ws: null, isConnected: false });
    };
  }, [queryClient, url]);

  const sendMessage = (input: WebSocketEvent) => {
    websocket.current?.send(JSON.stringify(input));
  };

  return { sendMessage, wsState };
};
