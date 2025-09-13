import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ScoreModule } from './score/score.module';
import { ScoreboardGateway } from './score/scoreboard.gateway';
import { AppController } from './app.controller';

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
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ScoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, ScoreboardGateway],
})
export class AppModule {}
