/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

import type { WebSocketClientProps } from '../utils/types';

export default function WebSocketClient({
  onConnectionId,
  connectionId,
}: WebSocketClientProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const webSocketEndpoint = import.meta.env.VITE_WEBSOCKET_ENDPOINT || '';

  useEffect(() => {
    console.log('webSocketEndpoint:', webSocketEndpoint);
    if (webSocketEndpoint) {
      const socket = new WebSocket(webSocketEndpoint);

      socket.onopen = () => {
        console.log('✅ Connected to WebSocket');
        socket.send(
          JSON.stringify({ action: 'hello', data: 'Client connected!' }),
        );
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📩 Message:', data);
        onConnectionId(data.connectionId);
        setMessages((prev) => [...prev, data]);
      };

      socket.onclose = () => {
        console.log('❌ Disconnected from WebSocket');
      };

      socket.onerror = (err) => {
        console.error('⚠️ WebSocket Error:', err);
      };

      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, []);

  return (
    <div>
      <>
        {messages.length > 0 && (
          <p className="title">{messages[messages.length - 1].message}</p>
        )}
      </>
      {connectionId ? (
        <p>🔗 {connectionId && 'Connected'}</p>
      ) : (
        <p>Waiting for connection...</p>
      )}
      <button
        onClick={() =>
          ws?.send(
            JSON.stringify({ action: 'ping', message: 'Hello from client' }),
          )
        }
      >
        Ping WSS
      </button>
    </div>
  );
}
