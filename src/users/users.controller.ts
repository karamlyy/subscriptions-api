import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
    type: UserResponseDto, 
  })
  async getMe(@Req() req: any): Promise<BaseResponse<UserResponseDto>> {
    const user = await this.usersService.getMe(req.user.userId);
    return success(user, 'User profile loaded');
  }
}


