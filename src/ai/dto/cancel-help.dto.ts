import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelHelpDto {
  @IsString()
  @IsNotEmpty()
  subscriptionName: string;

  @IsString()
  @IsOptional()
  platform?: string; // məsələn: 'iOS', 'Android', 'Web', 'Apple ID'...

  @IsString()
  @IsOptional()
  locale?: string; // məsələn: 'az', 'en'
}