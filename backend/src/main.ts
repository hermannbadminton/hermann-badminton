import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép CORS cho frontend kết nối
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, '0.0.0.0');
  console.log(`🏸 Badminton Tournament API Server running at http://localhost:${PORT}/api`);
}
bootstrap();
