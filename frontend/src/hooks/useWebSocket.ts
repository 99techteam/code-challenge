import { useState, useEffect } from 'react';
import type { Score } from '../types';

export const useWebSocket = () => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'SCORE_UPDATE') {
          setScores(message.data);
        }
      } catch (e) {
        console.error('Error parsing websocket message', e);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      } else {
        ws.onopen = () => ws.close();
      }
    };
  }, []);

  return { scores };
};
