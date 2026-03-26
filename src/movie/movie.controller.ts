import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entity/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import type { QueryRunner as QR } from 'typeorm';
import { CacheInterceptor as CI } from '@nestjs/cache-manager';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Public()
  @Get()
  @ApiOperation({ description: '[Movie]를 Pagination 하는 API' })
  @ApiResponse({
    status: 200,
    description: '성공적으로 API Pagination 실행 했을때',
  })
  getMovies(@Query() dto: GetMoviesDto, @UserId() userId?: number) {
    return this.movieService.findAll(dto, userId);
  }

  @Get('recent')
  @UseInterceptors(CI)
  getMoviesRecent() {
    return this.movieService.findRecent();
  }

  @Public()
  @Get('/:id')
  getMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findOne(id);
  }

  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() dto: CreateMovieDto,
    @UserId() userId: number,
    @QueryRunner() queryRunner: QR,
  ) {
    return this.movieService.create(dto, userId, queryRunner);
  }

  @Patch('/:id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovieDto,
  ) {
    return this.movieService.update(id, dto);
  }

  @Delete('/:id')
  @RBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }

  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDislike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
