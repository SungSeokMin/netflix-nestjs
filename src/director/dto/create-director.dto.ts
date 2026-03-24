import { IsDate, IsNotEmpty } from 'class-validator';

export class CreateDirectorDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsDate()
  dob: Date;

  @IsNotEmpty()
  nationality: string;
}
