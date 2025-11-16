import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Netflix' })
  name: string;

  @ApiProperty({ example: 'Entertainment', nullable: true })
  category?: string | null;

  @ApiProperty({ example: 9.99 })
  price: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 'MONTHLY' })
  billingCycle: string;

  @ApiProperty({
    example: '2025-11-16T00:00:00.000Z',
    description: 'İlk ödəniş tarixi (Date kimi, JSON-da string gəlir)',
  })
  firstPaymentDate: Date;

  @ApiProperty({
    example: '2025-12-16T00:00:00.000Z',
    description: 'Növbəti ödəniş tarixi',
  })
  nextPaymentDate: Date;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'Family plan', nullable: true })
  notes?: string | null;

  @ApiProperty({ example: '2025-11-16T10:15:30.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-16T10:15:30.000Z' })
  updatedAt: Date;
}