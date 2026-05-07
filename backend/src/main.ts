import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      'https://eldokshmators.netlify.app',
      'https://eldokshmotors.netlify.app',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  
  // Serve static files from the public folder
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });

  const port = process.env.PORT || 4321;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
