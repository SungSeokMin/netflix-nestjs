import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity()
export class BaseTable {
  @Exclude()
  @ApiHideProperty()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @ApiHideProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @ApiHideProperty()
  @VersionColumn()
  version: number;
}
