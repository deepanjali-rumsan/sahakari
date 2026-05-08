import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CooperativeService } from './cooperative.service';
import { CreateCooperativeDto } from './dto/cooperative.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('cooperative')
@Controller('cooperative')
export class CooperativeController {
  constructor(private cooperativeService: CooperativeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update cooperative' })
  createOrUpdate(@Body() dto: CreateCooperativeDto, @Request() req: any) {
    return this.cooperativeService.createOrUpdate(dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin cooperative' })
  getMyCooperative(@Request() req: any) {
    return this.cooperativeService.getMyCooperative(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if cooperative is set up' })
  checkCooperative(@Request() req: any) {
    return this.cooperativeService.checkCooperativeSetup(req.user.sub);
  }
}
