import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin/loans')
@Controller('admin/loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AdminLoanController {
  constructor(private loan: LoanService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loan.listAdmin({
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.loan.getById(id);
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Request() req: any,
    @Query('action') action: 'APPROVED' | 'REJECTED',
    @Query('reason') reason?: string,
  ) {
    return this.loan.review(id, req.user.sub, action, reason);
  }

  @Patch(':id/disburse')
  async disburse(
    @Param('id') id: string,
    @Request() req: any,
    @Body()
    body: {
      disbursedAmount?: number;
      interestRate?: number;
      paymentFrequency?:
        | 'DAILY'
        | 'WEEKLY'
        | 'MONTHLY'
        | 'QUARTERLY'
        | 'ANNUAL';
      numberOfInstallments?: number;
      gracePeriodDays?: number;
      lateFeePercentage?: number;
    } = {},
  ) {
    const loan = await this.loan.getById(id);

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return this.loan.disburseLoan(id, req.user.sub, {
      disbursedAmount:
        body.disbursedAmount ?? loan.disbursedAmount ?? loan.loanAmount ?? 0,
      interestRate: body.interestRate ?? loan.interestRate ?? 15,
      paymentFrequency:
        body.paymentFrequency ?? loan.paymentFrequency ?? 'MONTHLY',
      numberOfInstallments:
        body.numberOfInstallments ?? loan.numberOfInstallments ?? 12,
      gracePeriodDays: body.gracePeriodDays ?? loan.gracePeriodDays ?? 7,
      lateFeePercentage: body.lateFeePercentage ?? loan.lateFeePercentage ?? 2,
    });
  }
}
