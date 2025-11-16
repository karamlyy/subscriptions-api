import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ nullable: true })
  data: T | null;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data?: T | null,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data ?? null;
    this.timestamp = new Date().toISOString();
  }
}

export function success<T>(
  data: T,
  message = 'Operation successful',
  statusCode = 200,
): BaseResponse<T> {
  return new BaseResponse<T>(true, statusCode, message, data);
}

export function failure(
  message = 'An error occurred',
  statusCode = 400,
): BaseResponse<null> {
  return new BaseResponse<null>(false, statusCode, message, null);
}