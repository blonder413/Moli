import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WatchedMoviesModule } from './watched-movies/watched-movies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchedMovie } from './watched-movies/entities/watched-movie.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DB_HOST'),
        port: Number.parseInt(
          configService.get<string>('DB_PORT') ?? '3306',
          10,
        ),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [WatchedMovie],
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    WatchedMoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
