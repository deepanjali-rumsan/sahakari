import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { Prisma } from '@rs/db';

@Injectable()
export class LoanService {
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

  async listMine(userId: string) {
    return this.prisma.loanApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByIdForMember(userId: string, id: string) {
    const loan = await this.prisma.loanApplication.findUnique({
      where: { id },
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
      },
    });
  }

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
}
