// src/server.ts
import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();