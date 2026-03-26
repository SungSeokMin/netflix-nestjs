import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: false,
  });

  const config = new DocumentBuilder()
    .setTitle('Netflix')
    .setDescription('Netflix API')
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(WINSTON_MODULE_PROVIDER)),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
