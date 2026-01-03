#!/usr/bin/env node

/**
 * Simple Node.js WebSocket test client
 * Usage: node test-websocket.js
 */

const WebSocket = require('ws');

const wsUrl = process.env.WS_URL || 'ws://localhost:3000/ws/scoreboard';

console.log('🔌 Connecting to WebSocket server:', wsUrl);
console.log('---\n');

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server!');
  console.log('Waiting for messages...\n');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] 📨 Received message:`);
    console.log(`   Type: ${message.type}`);
    
    if (message.type === 'scoreboard_update' || message.type === 'connection_established') {
      if (message.data && message.data.scores) {
        console.log(`   Scores: ${message.data.scores.length} players`);
        console.log('\n   Top 10 Leaderboard:');
        message.data.scores.forEach((score, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
          console.log(`   ${medal} #${score.rank} ${score.username}: ${score.score} points`);
        });
      }
    }
    
    console.log('\n   Full message:', JSON.stringify(message, null, 2));
    console.log('---\n');
  } catch (error) {
    console.error('❌ Error parsing message:', error);
    console.log('Raw data:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  console.error('   Make sure the server is running on port 3000');
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Connection closed (code: ${code}, reason: ${reason || 'none'})`);
  process.exit(0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Closing connection...');
  ws.close();
});

// Keep the process alive
process.stdin.resume();

