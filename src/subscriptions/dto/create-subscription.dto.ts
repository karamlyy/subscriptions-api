import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Netflix' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ example: 'Entertainment' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'USD', description: '3-letter currency code' })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    example: 'MONTHLY',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
  })
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
  billingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @ApiProperty({
    example: '2025-11-16',
    description: 'İlk ödəniş tarixi (YYYY-MM-DD)',
  })
  @IsDateString()
  firstPaymentDate: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Family plan, 4 users' })
  @IsOptional()
  @IsString()
  notes?: string;
}