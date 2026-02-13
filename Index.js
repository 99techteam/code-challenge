import express from 'express';
import { WebSocketServer } from 'ws';
import { initWebSocket } from './WebSocket.js';

import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './src/problem4/summation_solution.js';
import CrudUser from '../code-challenge/src/problem5/CrudUser.js';
import Architecture from './src/problem6/Architecture.js';

import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config(); // loads .env file into process.env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); //to avoid clickjacking, XSS and browser based attacks

app.get('/problem4', (req, res) => {
  try {
    const results = {
      forLoop: sum_to_n_a(5),
      reducer: sum_to_n_b(5),
      recursion: sum_to_n_c(5)
    };
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use('/problem5/users', CrudUser);
app.use('/problem6', Architecture);

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

initWebSocket(wss);

export { app };
