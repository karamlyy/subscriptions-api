import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Karam Afandi' })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({ example: 'karam@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', minLength: 6 })
  @IsString()
  @Length(6, 50)
  password: string;
}