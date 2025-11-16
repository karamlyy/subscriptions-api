import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Karam Afandi' })
  name: string;

  @ApiProperty({ example: 'karam@example.com' })
  email: string;

  @ApiProperty({ example: '2025-11-16T10:15:30.000Z' })
  createdAt: Date;
}