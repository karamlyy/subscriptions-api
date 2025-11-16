import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly ACCESS_SECRET = process.env.JWT_SECRET || 'access_secret';
  private readonly REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || 'refresh_secret';

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('Bu email artıq qeydiyyatdan keçib');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });

    await this.usersRepo.save(user);

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return this.buildAuthResponse(user, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email və ya şifrə yanlışdır');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email və ya şifrə yanlışdır');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return this.buildAuthResponse(user, tokens);
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = dto;

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException('Refresh token yanlışdır və ya vaxtı bitib');
    }

    const user = await this.usersRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Refresh token tapılmadı');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new ForbiddenException('Refresh token uyğunsuzdur');
    }

    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      throw new ForbiddenException('Refresh token vaxtı bitib');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return this.buildAuthResponse(user, tokens);
  }

  // ===== Helpers =====

  private toUserResponse(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    return dto;
  }

  private buildAuthResponse(
    user: User,
    tokens: { accessToken: string; refreshToken: string },
  ): AuthResponseDto {
    const res = new AuthResponseDto();
    res.user = this.toUserResponse(user);
    res.accessToken = tokens.accessToken;
    res.refreshToken = tokens.refreshToken;
    return res;
  }

  private async generateTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(userId, email),
      this.signRefreshToken(userId, email),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);

    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 gün

    await this.usersRepo.update(
      { id: userId },
      {
        refreshToken: hashed,
        refreshTokenExpires: expires,
      },
    );
  }

  private signAccessToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload, {
      secret: this.ACCESS_SECRET,
      expiresIn: Number(process.env.JWT_EXPIRES_IN || 900),
    });
  }

  private signRefreshToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };
    // 7 gün saniyə olaraq
    return this.jwtService.signAsync(payload, {
      secret: this.REFRESH_SECRET,
      expiresIn: 7 * 24 * 60 * 60,
    });
  }
}