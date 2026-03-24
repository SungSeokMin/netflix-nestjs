import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagenation.dto';
import { ObjectLiteral } from 'typeorm';

export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;

    const skip = (page - 1) * take;

    qb.take(take);
    qb.skip(skip);
  }
}
