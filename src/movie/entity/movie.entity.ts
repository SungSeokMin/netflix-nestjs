import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from '../../director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { Transform } from 'class-transformer';
import { User } from 'src/user/entity/user.entity';
import { MovieUserLike } from './movie-user-like.entity';

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column()
  @Transform(({ value }) => `http://localhost:3000/${value}`)
  movieFilePath: string;

  @ManyToOne(() => User, (user) => user.createdMovies)
  creator: User;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: 'detail_id' })
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.movies, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: 'director_id' })
  director: Director;

  @OneToMany(() => MovieUserLike, (mul) => mul.movie)
  likedUsers: MovieUserLike[];
}
