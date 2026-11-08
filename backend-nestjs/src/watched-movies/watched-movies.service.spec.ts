import { Test, TestingModule } from '@nestjs/testing';
import { WatchedMoviesService } from './watched-movies.service';

describe('WatchedMoviesService', () => {
  let service: WatchedMoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchedMoviesService],
    }).compile();

    service = module.get<WatchedMoviesService>(WatchedMoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
