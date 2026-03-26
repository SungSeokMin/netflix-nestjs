import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';

export class GetMoviesDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '영화의 제목' })
  title?: string;
}
