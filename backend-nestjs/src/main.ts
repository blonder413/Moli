import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina del objeto cualquier propiedad que no esté en el DTO
      forbidNonWhitelisted: true, // Lanza un error si envían datos de más
      transform: true, // Transforma automáticamente los tipos (ej: strings a números si el DTO lo pide)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
