import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { BaseResponse, success } from '../common/base-response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yeni istifadəçi qeydiyyatı' })
  @ApiCreatedResponse({
    description: 'İstifadəçi yaradıldı, access + refresh token qaytarıldı',
    type: AuthResponseDto, // real cavab BaseResponse<AuthResponseDto> olacaq
  })
  @ApiBadRequestResponse({ description: 'Validation xətası və ya email artıq var' })
  async register(
    @Body() dto: RegisterDto,
  ): Promise<BaseResponse<AuthResponseDto>> {
    const result = await this.authService.register(dto);
    return success(result, 'User registered successfully', 201);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login olub token almaq' })
  @ApiOkResponse({
    description: 'Login uğurlu, access + refresh token qaytarıldı',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Email və ya şifrə yanlışdır' })
  async login(
    @Body() dto: LoginDto,
  ): Promise<BaseResponse<AuthResponseDto>> {
    const result = await this.authService.login(dto);
    return success(result, 'Login successful');
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token ilə yeni tokenlər almaq' })
  @ApiOkResponse({
    description: 'Tokenlər yeniləndi',
    type: AuthResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Refresh token yanlışdır və ya vaxtı bitib' })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<BaseResponse<AuthResponseDto>> {
    const result = await this.authService.refreshTokens(dto);
    return success(result, 'Tokens refreshed');
  }
}