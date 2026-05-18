import express from 'express';
import cors from 'cors';
import http from 'http';
import { setupWebSocket } from './websocket/scoreboard';

import coinRoutes from './routes/coins';
import exchangeRateRoutes from './routes/exchangeRate';
import swapRoutes from './routes/swap';
import scoreRoutes from './routes/scores';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/coins', coinRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/scores', scoreRoutes);

setupWebSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
