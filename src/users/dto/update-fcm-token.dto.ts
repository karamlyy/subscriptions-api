import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @ApiProperty({
    example:
      'eS3Jj8s3TtG7b1L2mN0pQ9rX4vW8zA1bC6dE5fG7hJ9kL0mN2pQ4rT6vW8yZ0',
    description: 'Firebase Cloud Messaging (FCM) device token',
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}