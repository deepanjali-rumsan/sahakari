import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { Prisma, PaymentFrequency } from '@rs/db';

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  private readonly loanEligibleKycStatuses = [
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
  ] as const;

  constructor(
    private prisma: PrismaService,
    private notif: NotificationService,
  ) {}

  private generateRef(): string {
    return `SAH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private sanitizeNumericFields(data: any): any {
    const numericFields = [
      'loanAmount',
      'guaranteeAmount',
      'age',
      'wardNumber',
    ];
    const sanitized = { ...data };

    numericFields.forEach((field) => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        const parsed = parseFloat(sanitized[field]);
        sanitized[field] = isNaN(parsed) ? null : parsed;
      }
    });

    return sanitized;
  }

  /**
   * Calculate number of periods per year based on payment frequency
   */
  private getPeriodsPerYear(frequency: PaymentFrequency): number {
    const periods = {
      DAILY: 365,
      WEEKLY: 52,
      MONTHLY: 12,
      QUARTERLY: 4,
      ANNUAL: 1,
    };
    return periods[frequency];
  }

  /**
   * Add a period to a date based on payment frequency
   */
  private addPeriod(date: Date, frequency: PaymentFrequency): Date {
    const newDate = new Date(date);

    switch (frequency) {
      case 'DAILY':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'WEEKLY':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'MONTHLY':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case 'ANNUAL':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }

    return newDate;
  }

  /**
   * Generate loan payment schedule using reducing balance method
   */
  private generateLoanSchedule(
    loanId: string,
    principal: number,
    annualRate: number,
    numInstallments: number,
    frequency: PaymentFrequency,
    disbursedDate: Date,
  ) {
    const periodsPerYear = this.getPeriodsPerYear(frequency);
    const periodicRate = annualRate / 100 / periodsPerYear;

    // Calculate EMI (Equated Monthly/Periodic Installment) using reducing balance
    const emi =
      (principal * periodicRate * Math.pow(1 + periodicRate, numInstallments)) /
      (Math.pow(1 + periodicRate, numInstallments) - 1);

    let remainingBalance = principal;
    let currentDate = new Date(disbursedDate);
    const installments: Prisma.LoanInstallmentCreateManyInput[] = [];

    for (let i = 0; i < numInstallments; i++) {
      // Calculate next due date
      currentDate = this.addPeriod(currentDate, frequency);

      const interestAmount = remainingBalance * periodicRate;
      const principalAmount = emi - interestAmount;
      remainingBalance = remainingBalance - principalAmount;

      installments.push({
        loanApplicationId: loanId,
        installmentNumber: i + 1,
        dueDate: new Date(currentDate),
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100,
        totalAmount: Math.round(emi * 100) / 100,
      });
    }

    this.logger.log(
      `Generated ${numInstallments} installments for loan ${loanId}, EMI: ${Math.round(emi * 100) / 100}`,
    );

    return installments;
  }

  // ============================================================================
  // EXISTING METHODS (User-facing loan application)
  // ============================================================================

  async listMine(userId: string) {
    return this.prisma.loanApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        installments: {
          where: { isPaid: false },
          orderBy: { dueDate: 'asc' },
          take: 1, // Show next payment due
        },
      },
    });
  }

  async getByIdForMember(userId: string, id: string) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
    if (!loan || loan.userId !== userId) throw new ForbiddenException();
    return loan;
  }

  async create(userId: string) {
    return this.prisma.loanApplication.create({
      data: {
        userId,
        referenceNumber: this.generateRef(),
      },
    });
  }

  async updatePersonalInfo(
    userId: string,
    id: string,
    data: Partial<Prisma.LoanApplicationUpdateInput>,
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!loan || loan.userId !== userId) throw new ForbiddenException();
    const sanitizedData = this.sanitizeNumericFields(data);
    return this.prisma.loanApplication.update({
      where: { id },
      data: sanitizedData,
    });
  }

  async updateLoanDetails(
    userId: string,
    id: string,
    data: Partial<Prisma.LoanApplicationUpdateInput>,
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!loan || loan.userId !== userId) throw new ForbiddenException();
    const sanitizedData = this.sanitizeNumericFields(data);
    return this.prisma.loanApplication.update({
      where: { id },
      data: sanitizedData,
    });
  }

  async updateAddress(
    userId: string,
    id: string,
    data: Partial<Prisma.LoanApplicationUpdateInput>,
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!loan || loan.userId !== userId) throw new ForbiddenException();
    const sanitizedData = this.sanitizeNumericFields(data);
    return this.prisma.loanApplication.update({
      where: { id },
      data: sanitizedData,
    });
  }

  async updateTermsGuarantor(
    userId: string,
    id: string,
    data: Partial<Prisma.LoanApplicationUpdateInput>,
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!loan || loan.userId !== userId) throw new ForbiddenException();
    const sanitizedData = this.sanitizeNumericFields(data);
    return this.prisma.loanApplication.update({
      where: { id },
      data: sanitizedData,
    });
  }

  async updateDocuments(
    userId: string,
    id: string,
    data: Partial<Prisma.LoanApplicationUpdateInput>,
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!loan || loan.userId !== userId) throw new ForbiddenException();
    const sanitizedData = this.sanitizeNumericFields(data);
    return this.prisma.loanApplication.update({
      where: { id },
      data: sanitizedData,
    });
  }

  async submit(userId: string, id: string) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!loan || loan.userId !== userId) throw new ForbiddenException();
    if (loan.status !== 'DRAFT')
      throw new BadRequestException('Loan already submitted');

    const kyc = await this.prisma.kyc.findUnique({ where: { userId } });
    if (
      !kyc ||
      !this.loanEligibleKycStatuses.includes(
        kyc.status as (typeof this.loanEligibleKycStatuses)[number],
      )
    ) {
      throw new BadRequestException(
        'KYC must be submitted before submitting a loan application',
      );
    }

    return this.prisma.loanApplication.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async listAdmin(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const where = status ? { status: status as any } : {};
    const [data, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              fullName: true,
              cooperative: true,
              passbookNumber: true,
            },
          },
          installments: {
            where: { isPaid: false },
            orderBy: { dueDate: 'asc' },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            fullName: true,
            cooperative: true,
            passbookNumber: true,
            kyc: {
              select: {
                digitalSignatureUrl: true,
                rightThumbUrl: true,
                leftThumbUrl: true,
              },
            },
          },
        },
        district: {
          select: {
            id: true,
            name: true,
          },
        },
        municipality: {
          select: {
            id: true,
            name: true,
          },
        },
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
  }

  /**
   * Review and approve/reject loan application
   */
  async review(
    id: string,
    adminId: string,
    action: 'APPROVED' | 'REJECTED',
    reason?: string,
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(loan.status)) {
      throw new BadRequestException('Loan cannot be reviewed in current state');
    }

    const updated = await this.prisma.loanApplication.update({
      where: { id },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedById: adminId,
        rejectionReason: reason,
      },
    });

    const title = action === 'APPROVED' ? 'Loan Approved' : 'Loan Rejected';
    const message =
      action === 'APPROVED'
        ? `Your loan application (Ref: ${loan.referenceNumber}) has been approved.`
        : `Your loan application (Ref: ${loan.referenceNumber}) has been rejected.${reason ? ` Reason: ${reason}` : ''}`;

    await this.notif.send(loan.userId, 'LOAN_STATUS', title, message, true);

    return updated;
  }

  // ============================================================================
  // NEW: LOAN DISBURSEMENT & TRACKING
  // ============================================================================

  /**
   * Disburse loan as cash to user
   * This is the recommended method for cooperatives
   */
  async disburseLoan(
    loanId: string,
    adminId: string,
    disbursementData: {
      disbursedAmount: number;
      interestRate: number;
      paymentFrequency: PaymentFrequency;
      numberOfInstallments: number;
      gracePeriodDays?: number;
      lateFeePercentage?: number;
    },
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id: loanId },
      include: { user: true },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== 'APPROVED') {
      throw new BadRequestException('Only approved loans can be disbursed');
    }

    if (loan.isDisbursed) {
      throw new ConflictException('Loan already disbursed');
    }

    const {
      disbursedAmount,
      interestRate,
      paymentFrequency,
      numberOfInstallments,
      gracePeriodDays = 7,
      lateFeePercentage = 2,
    } = disbursementData;

    this.logger.log(
      `[disburseLoan] loanId=${loanId}, amount=${disbursedAmount}, rate=${interestRate}%, frequency=${paymentFrequency}, installments=${numberOfInstallments}`,
    );

    return await this.prisma.$transaction(async (tx) => {
      // 1. Mark loan as disbursed
      const updatedLoan = await tx.loanApplication.update({
        where: { id: loanId },
        data: {
          isDisbursed: true,
          disbursedDate: new Date(),
          disbursedAmount,
          interestRate,
          paymentFrequency,
          numberOfInstallments,
          outstandingBalance: disbursedAmount,
          gracePeriodDays,
          lateFeePercentage,
          status: 'ACTIVE',
          totalPaid: 0,
        },
      });

      // 2. Generate payment schedule
      const installments = this.generateLoanSchedule(
        loanId,
        disbursedAmount,
        interestRate,
        numberOfInstallments,
        paymentFrequency,
        new Date(),
      );

      await tx.loanInstallment.createMany({
        data: installments,
      });

      this.logger.log(
        `✅ Loan ${loanId} disbursed: NPR ${disbursedAmount}, ${numberOfInstallments} installments created`,
      );

      // 3. Send notification to user
      await this.notif.send(
        loan.userId,
        'LOAN_STATUS',
        'Loan Disbursed',
        `Your loan of NPR ${disbursedAmount} has been disbursed. Please check your payment schedule.`,
        true,
      );

      return updatedLoan;
    });
  }

  /**
   * Optional: Disburse loan to user's passbook
   * Use this if cooperative adds loan amount to passbook first
   */
  async disburseLoanToPassbook(
    loanId: string,
    adminId: string,
    disbursementData: {
      disbursedAmount: number;
      interestRate: number;
      paymentFrequency: PaymentFrequency;
      numberOfInstallments: number;
      gracePeriodDays?: number;
      lateFeePercentage?: number;
    },
  ) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id: loanId },
      include: {
        user: {
          include: { passbook: true },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (!loan.user.passbook) {
      throw new NotFoundException('User does not have a passbook');
    }

    if (loan.status !== 'APPROVED') {
      throw new BadRequestException('Only approved loans can be disbursed');
    }

    if (loan.isDisbursed) {
      throw new ConflictException('Loan already disbursed');
    }

    const {
      disbursedAmount,
      interestRate,
      paymentFrequency,
      numberOfInstallments,
      gracePeriodDays = 7,
      lateFeePercentage = 2,
    } = disbursementData;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Add money to user's passbook
      const passbook = loan.user.passbook!;
      const newBalance = passbook.currentBalance + disbursedAmount;

      await tx.passbookTransaction.create({
        data: {
          passbookId: passbook.id,
          type: 'LOAN_DISBURSEMENT',
          amount: disbursedAmount,
          description: `Loan disbursement - ${loan.referenceNumber}`,
          balanceAfter: newBalance,
          loanApplicationId: loanId,
        },
      });

      await tx.passbook.update({
        where: { id: passbook.id },
        data: {
          currentBalance: { increment: disbursedAmount },
        },
      });

      // 2. Mark loan as disbursed and generate schedule
      const updatedLoan = await tx.loanApplication.update({
        where: { id: loanId },
        data: {
          isDisbursed: true,
          disbursedDate: new Date(),
          disbursedAmount,
          interestRate,
          paymentFrequency,
          numberOfInstallments,
          outstandingBalance: disbursedAmount,
          gracePeriodDays,
          lateFeePercentage,
          status: 'ACTIVE',
          totalPaid: 0,
        },
      });

      // 3. Generate payment schedule
      const installments = this.generateLoanSchedule(
        loanId,
        disbursedAmount,
        interestRate,
        numberOfInstallments,
        paymentFrequency,
        new Date(),
      );

      await tx.loanInstallment.createMany({
        data: installments,
      });

      this.logger.log(
        `✅ Loan ${loanId} disbursed to passbook: NPR ${disbursedAmount}`,
      );

      // 4. Send notification
      await this.notif.send(
        loan.userId,
        'LOAN_STATUS',
        'Loan Disbursed',
        `Your loan of NPR ${disbursedAmount} has been added to your passbook.`,
        true,
      );

      return updatedLoan;
    });
  }

  // ============================================================================
  // LOAN PAYMENT RECORDING
  // ============================================================================

  /**
   * Record a loan payment made by user (cash payment)
   * This does NOT deduct from passbook - it's a separate cash transaction
   */
  async recordLoanPayment(
    loanId: string,
    installmentNumber: number,
    amountPaid: number,
    paymentDate: Date,
    adminId: string,
  ) {
    const installment = await this.prisma.loanInstallment.findUnique({
      where: {
        loanApplicationId_installmentNumber: {
          loanApplicationId: loanId,
          installmentNumber,
        },
      },
      include: {
        loanApplication: {
          include: { user: true },
        },
      },
    });

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    if (installment.isPaid) {
      throw new ConflictException('Installment already paid');
    }

    // Calculate penalty if payment is late
    let penaltyAmount = 0;
    let daysPastDue = 0;

    const paymentDateTime = new Date(paymentDate);
    if (paymentDateTime > installment.dueDate) {
      daysPastDue = Math.floor(
        (paymentDateTime.getTime() - installment.dueDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Apply penalty only after grace period
      const gracePeriod = installment.loanApplication.gracePeriodDays || 7;
      if (daysPastDue > gracePeriod) {
        const monthsLate = Math.ceil(daysPastDue / 30);
        penaltyAmount =
          installment.totalAmount *
          ((installment.loanApplication.lateFeePercentage || 2) / 100) *
          monthsLate;
        penaltyAmount = Math.round(penaltyAmount * 100) / 100;
      }
    }

    const totalDue = installment.totalAmount + penaltyAmount;

    if (amountPaid < totalDue) {
      throw new BadRequestException(
        `Insufficient payment. Total due: NPR ${totalDue} (Base: NPR ${installment.totalAmount}, Penalty: NPR ${penaltyAmount}), but received: NPR ${amountPaid}`,
      );
    }

    this.logger.log(
      `[recordLoanPayment] loanId=${loanId}, installment=${installmentNumber}, amount=${amountPaid}, penalty=${penaltyAmount}, daysPastDue=${daysPastDue}`,
    );

    return await this.prisma.$transaction(async (tx) => {
      // 1. Mark installment as paid
      const updatedInstallment = await tx.loanInstallment.update({
        where: { id: installment.id },
        data: {
          isPaid: true,
          paidAmount: amountPaid,
          paidDate: paymentDateTime,
          penaltyAmount,
          daysPastDue,
        },
      });

      // 2. Update loan application
      const newOutstanding =
        (installment.loanApplication.outstandingBalance ?? 0) -
        installment.principalAmount;

      const isCompleted = newOutstanding <= 0.01; // Handle floating point

      await tx.loanApplication.update({
        where: { id: loanId },
        data: {
          outstandingBalance: Math.max(0, newOutstanding),
          totalPaid: { increment: amountPaid },
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
        },
      });

      this.logger.log(
        `✅ Payment recorded: Installment #${installmentNumber}, Amount: NPR ${amountPaid}, Remaining balance: NPR ${Math.max(0, newOutstanding)}`,
      );

      // 3. Send notification to user
      await this.notif.send(
        installment.loanApplication.userId,
        'LOAN_STATUS',
        'Payment Received',
        `Your loan payment of NPR ${amountPaid} for installment #${installmentNumber} has been recorded.${penaltyAmount > 0 ? ` Late fee: NPR ${penaltyAmount}` : ''}${isCompleted ? ' Your loan is now fully paid!' : ''}`,
        true,
      );

      return {
        success: true,
        installment: updatedInstallment,
        penaltyAmount,
        totalPaid: amountPaid,
        remainingBalance: Math.max(0, newOutstanding),
        isLoanCompleted: isCompleted,
      };
    });
  }

  /**
   * Get payment schedule for a loan
   */
  async getPaymentSchedule(loanId: string) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id: loanId },
      include: {
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
        user: {
          select: {
            fullName: true,
            passbookNumber: true,
          },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const paidInstallments = loan.installments.filter((i) => i.isPaid);
    const unpaidInstallments = loan.installments.filter((i) => !i.isPaid);
    const totalPenalties = loan.installments.reduce(
      (sum, i) => sum + i.penaltyAmount,
      0,
    );

    return {
      loan: {
        id: loan.id,
        referenceNumber: loan.referenceNumber,
        disbursedAmount: loan.disbursedAmount,
        interestRate: loan.interestRate,
        outstandingBalance: loan.outstandingBalance,
        totalPaid: loan.totalPaid,
        status: loan.status,
        user: loan.user,
      },
      summary: {
        totalInstallments: loan.installments.length,
        paidInstallments: paidInstallments.length,
        unpaidInstallments: unpaidInstallments.length,
        totalPenalties,
        nextPaymentDue: unpaidInstallments[0] || null,
      },
      installments: loan.installments,
    };
  }

  /**
   * Get all active loans with overdue payments
   */
  async getOverdueLoans() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loans = await this.prisma.loanApplication.findMany({
      where: {
        status: { in: ['ACTIVE', 'OVERDUE'] },
        installments: {
          some: {
            isPaid: false,
            dueDate: { lt: today },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            passbookNumber: true,
          },
        },
        installments: {
          where: {
            isPaid: false,
            dueDate: { lt: today },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    return loans.map((loan) => ({
      ...loan,
      overdueCount: loan.installments.length,
      oldestOverdue: loan.installments[0],
    }));
  }

  /**
   * Check and update overdue loan status (run daily via cron)
   */
  async checkOverdueLoans() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.logger.log(
      `[checkOverdueLoans] Running overdue check for ${today.toISOString()}`,
    );

    const overdueInstallments = await this.prisma.loanInstallment.findMany({
      where: {
        isPaid: false,
        dueDate: { lt: today },
      },
      include: {
        loanApplication: {
          include: { user: true },
        },
      },
    });

    this.logger.log(`Found ${overdueInstallments.length} overdue installments`);

    let notificationsSent = 0;
    let loansMarkedOverdue = 0;

    for (const installment of overdueInstallments) {
      // Update loan status to OVERDUE if not already
      if (installment.loanApplication.status === 'ACTIVE') {
        await this.prisma.loanApplication.update({
          where: { id: installment.loanApplication.id },
          data: { status: 'OVERDUE' },
        });
        loansMarkedOverdue++;
      }

      // Send notification to user
      const daysPastDue = Math.floor(
        (today.getTime() - installment.dueDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      await this.notif.send(
        installment.loanApplication.userId,
        'LOAN_STATUS',
        'Loan Payment Overdue',
        `Your installment #${installment.installmentNumber} was due on ${installment.dueDate.toLocaleDateString()}. It is now ${daysPastDue} days overdue. Please make payment soon to avoid additional penalties.`,
        true,
      );
      notificationsSent++;
    }

    this.logger.log(
      `✅ Overdue check complete: ${loansMarkedOverdue} loans marked overdue, ${notificationsSent} notifications sent`,
    );

    return {
      overdueInstallments: overdueInstallments.length,
      loansMarkedOverdue,
      notificationsSent,
    };
  }
}
