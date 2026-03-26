import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @ApiProperty({ description: '영화 제목', example: '겨울왕국' })
  title: string;

  @IsNotEmpty()
  @ApiProperty({ description: '영화 설명', example: '재밌어요' })
  detail: string;

  @IsNotEmpty()
  @ApiProperty({ description: '감독 ID', example: 1 })
  directorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @ApiProperty({ description: '장르 IDs', example: [1, 2, 3] })
  genreIds: number[];

  @IsString()
  @ApiProperty({
    description: '영화 파일 이름',
    example: 'aaa-bbb-ccc-ddd.jpg',
  })
  movieFileName: string;
}
