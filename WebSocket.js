let wss;

export function initWebSocket(server) {
  wss = server;

  // Handle new connections
  wss.on('connection', ws => {
    console.log('Client connected to Problem 6');
    ws.send(JSON.stringify({ message: 'Connected to Problem 6 live updates' }));
  });
}

export function broadcastProblem6(data) {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}