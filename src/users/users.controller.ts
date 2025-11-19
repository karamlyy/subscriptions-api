import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { BaseResponse, success } from '../common/base-response';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Hazırkı istifadəçinin profili' })
  @ApiOkResponse({
    description: 'İstifadəçi profili qaytarıldı',
    type: UserResponseDto, // real cavab BaseResponse<UserResponseDto> olacaq
  })
  async getMe(@Req() req: any): Promise<BaseResponse<UserResponseDto>> {
    const user = await this.usersService.getMe(req.user.userId);
    return success(user, 'User profile loaded');
  }

  @Patch('me/fcm-token')
  @ApiOperation({ summary: 'Hazırkı istifadəçinin FCM tokenini yenilə' })
  @ApiOkResponse({
    description: 'FCM token yeniləndi',
    type: String,
  })
  async updateFcmToken(
    @Req() req: any,
    @Body() dto: UpdateFcmTokenDto,
  ): Promise<BaseResponse<null>> {
    await this.usersService.updateFcmToken(req.user.userId, dto);
    return success(null, 'FCM token updated');
  }
}


