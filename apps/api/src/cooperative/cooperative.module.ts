import { Module } from '@nestjs/common';
import { CooperativeController } from './cooperative.controller';
import { CooperativeService } from './cooperative.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CooperativeController],
  providers: [CooperativeService],
  exports: [CooperativeService],
})
export class CooperativeModule {}
