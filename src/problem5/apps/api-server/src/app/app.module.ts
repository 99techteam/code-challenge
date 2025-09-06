import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CustomLoggerModule } from '@problem5/custom-logger'
import { ProductModule } from '@problem5/product'

import { PrismaModule, PrismaServiceOptions } from 'nestjs-prisma'

import { AppController } from './app.controller'

const controllers = []

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
      envFilePath: ['.env'],
    }),
    CustomLoggerModule, // Add this early in the imports array
    PrismaModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory(configService: ConfigService): PrismaServiceOptions {
        return {
          prismaOptions: {
            log: [configService.getOrThrow('LOG_LEVEL')],
            datasourceUrl: configService.getOrThrow('DATABASE_URL'),
          },
        }
      },
      inject: [ConfigService],
    }),
    ProductModule,
  ],
  controllers: [AppController, ...controllers],
  providers: [],
})
export class AppModule {}
