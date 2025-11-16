import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { BaseResponse, success } from '../common/base-response';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Hazırkı istifadəçinin bütün subscription-ları' })
  @ApiOkResponse({
    description: 'Subscription siyahısı qaytarıldı',
    type: [SubscriptionResponseDto], // real cavab BaseResponse<SubscriptionResponseDto[]>
  })
  async findAll(@Req() req: any): Promise<BaseResponse<SubscriptionResponseDto[]>> {
    const list = await this.subsService.findAllForUser(req.user.userId);
    return success(list, 'Subscriptions loaded');
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID-yə görə 1 subscription qaytarır' })
  @ApiOkResponse({
    description: 'Subscription tapıldı',
    type: SubscriptionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Subscription tapılmadı' })
  @ApiForbiddenResponse({ description: 'Bu subscription-a çıxış icazən yoxdur' })
  async findOne(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponse<SubscriptionResponseDto>> {
    const sub = await this.subsService.findOneForUser(req.user.userId, id);
    return success(sub, 'Subscription loaded');
  }

  @Post()
  @ApiOperation({ summary: 'Yeni subscription yaradır' })
  @ApiCreatedResponse({
    description: 'Subscription yaradıldı',
    type: SubscriptionResponseDto,
  })
  async create(
    @Req() req: any,
    @Body() dto: CreateSubscriptionDto,
  ): Promise<BaseResponse<SubscriptionResponseDto>> {
    const created = await this.subsService.createForUser(req.user.userId, dto);
    return success(created, 'Subscription created', 201);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Subscription-u yeniləyir' })
  @ApiOkResponse({
    description: 'Subscription yeniləndi',
    type: SubscriptionResponseDto,
  })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<BaseResponse<SubscriptionResponseDto>> {
    const updated = await this.subsService.updateForUser(req.user.userId, id, dto);
    return success(updated, 'Subscription updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Subscription-u silir' })
  @ApiOkResponse({ description: 'Subscription silindi' })
  async remove(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponse<null>> {
    await this.subsService.deleteForUser(req.user.userId, id);
    return success(null, 'Subscription deleted');
  }
}