import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getMe(userId: number): Promise<UserResponseDto> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tapılmadı');
    }

    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }

  async updateFcmToken(
    userId: number,
    dto: UpdateFcmTokenDto,
  ): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User tapılmadı');
    }

    user.fcmToken = dto.fcmToken;
    await this.usersRepo.save(user);
  }
}


