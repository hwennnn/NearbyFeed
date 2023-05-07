import {
  IsLatitude,
  IsLongitude,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(4)
  @MaxLength(25)
  title: string;

  @IsString()
  @MinLength(15)
  @MaxLength(100)
  content: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}
