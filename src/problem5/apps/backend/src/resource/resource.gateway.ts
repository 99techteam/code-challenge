// src/resource/resource.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: { origin: '*' } })
export class ResourceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  // Nhận event từ EventEmitter và phát ra cho client
  @OnEvent('resource.created')
  handleCreated(resource: any) {
    this.server.emit('resource.created', resource);
  }

  @OnEvent('resource.updated')
  handleUpdated(resource: any) {
    this.server.emit('resource.updated', resource);
  }

  @OnEvent('resource.deleted')
  handleDeleted(id: string) {
    this.server.emit('resource.deleted', id);
  }
}
