import { IsOptional, IsString } from 'class-validator';
import { PagePaginationDto } from 'src/common/dto/page-pagenation.dto';

export class GetMoviesDto extends PagePaginationDto {
  @IsString()
  @IsOptional()
  title?: string;
}
