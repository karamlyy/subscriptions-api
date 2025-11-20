import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelHelpDto {
  @IsString()
  @IsNotEmpty()
  subscriptionName: string;

  @IsString()
  @IsOptional()
  platform?: string; 

  @IsString()
  @IsOptional()
  locale?: string; 
}