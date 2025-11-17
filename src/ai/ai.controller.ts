// src/ai/ai.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { CancelHelpDto } from './dto/cancel-help.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(AuthGuard('jwt')) 
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('cancel-help')
  @ApiOperation({ summary: 'Get AI cancelation instructions for a subscription' })
  async getCancelHelp(@Body() dto: CancelHelpDto) {
    const instructions = await this.aiService.getCancelHelp(dto);

    return {
      success: true,
      statusCode: 200,
      message: 'AI cancel instructions generated',
      data: { instructions },
      timestamp: new Date().toISOString(),
    };
  }
}