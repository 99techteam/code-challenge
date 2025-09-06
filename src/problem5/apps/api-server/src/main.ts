/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SnakeToCamelInterceptor } from '@problem5/shared'

import { LoggerErrorInterceptor, Logger as PinoLogger } from 'nestjs-pino'
import { ZodValidationPipe } from 'nestjs-zod'

import { AppModule } from './app'
import {
  ResponseExceptionFilter,
  ResponseLoggerInterceptor,
  TraceIdInterceptor,
  ZodValidationExceptionFilter,
} from './interceptors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  })

  app.useGlobalPipes(new ZodValidationPipe())

  app.useGlobalFilters(new ResponseExceptionFilter(), new ZodValidationExceptionFilter())
  app.useGlobalInterceptors(
    new ResponseLoggerInterceptor(),
    new LoggerErrorInterceptor(),
    new TraceIdInterceptor(),
    new SnakeToCamelInterceptor()
  )

  app.useLogger(app.get(PinoLogger))

  const config = new DocumentBuilder()
    .setTitle('Problem5 API')
    .setDescription('The Problem5 API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  const port = process.env.PORT || 3000
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}`)
}

bootstrap()
