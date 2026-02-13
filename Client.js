// client.js
import WebSocket from 'ws';

function connect() {
  const socket = new WebSocket('ws://localhost:3000'); // adjust port if needed

  socket.on('open', () => {
    console.log('Connected to Problem 6 WebSocket');
  });

  socket.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'leaderboardUpdate') {
        console.log('Leaderboard updated:');
        msg.leaderboard.forEach(user => {
          console.log(`${user.name}: ${user.score}`);
        });
      } else {
        console.log('Received:', msg);
      }
    } catch (err) {
      console.error('Failed to parse message:', data);
    }
  });

  socket.on('close', () => {
    console.log('Disconnected from WebSocket server, retrying in 5s...');
    setTimeout(connect, 5000); // retry after 5 seconds
  });

  socket.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    // Close and retry
    socket.close();
  });
}

// Initial connect attempt
connect();