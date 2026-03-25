import { Column, Entity, JoinColumn, PrimaryColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { User } from 'src/user/entity/user.entity';
import { ManyToOne } from 'typeorm';

@Entity()
export class MovieUserLike {
  @PrimaryColumn({
    name: 'movie_id',
    type: 'int8',
  })
  @JoinColumn({ name: 'movie_id' })
  @ManyToOne(() => Movie, (movie) => movie.likedUsers, { onDelete: 'CASCADE' })
  movie: Movie;

  @PrimaryColumn({
    name: 'user_id',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likedMovies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  isLike: boolean;
}
