const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const { buildLeaderboard } = require('./lib/leaderboard');
const { PORT } = require('./lib/config');

const { app, store, bus } = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

bus.emit = (event, payload) => io.emit(event, payload);

io.on('connection', (socket) => {
  socket.emit('board:snapshot', {
    leaderboard: buildLeaderboard(store, 10),
    updatedAt: new Date().toISOString()
  });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`scoreboard demo on http://localhost:${PORT}`);
    console.log(`${store.allPlayers().length} seeded players (password: pass123)`);
  });
}

module.exports = { app, server, io, store };
