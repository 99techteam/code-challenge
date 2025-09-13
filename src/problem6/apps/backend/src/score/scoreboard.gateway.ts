import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { ScoreService } from '../score/score.service';

@WebSocketGateway({ cors: true })
export class ScoreboardGateway implements OnGatewayInit {
  constructor(private readonly scoreService: ScoreService) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  @SubscribeMessage('joinScoreboard')
  handleJoin(client: Socket) {
    client.join('scoreboard');
  }

  @OnEvent('score.updated')
  async handleScoreUpdated() {
    const top10 = await this.scoreService.getTop10();
    this.server.to('scoreboard').emit('scoreboard.updated', top10); // ⬅️ dùng được
  }
}
