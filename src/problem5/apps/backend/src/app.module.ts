import { Module } from '@nestjs/common';
import { ResourceController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceModule } from './resource/resource.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ResourceGateway } from './resource/resource.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      dbName: process.env.MONGO_DB_NAME,
      autoCreate: true,
    }),
    ResourceModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [ResourceController],
  providers: [AppService, ResourceGateway],
})
export class AppModule {}
