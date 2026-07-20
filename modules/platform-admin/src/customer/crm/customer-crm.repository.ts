import { Injectable } from '@nestjs/common';
import { CustomerPrismaService } from '../prisma/customer.prisma.service';

/**
 * CRM repository — Suite-owned contact data (Contract A §6.2: "Suite: CRM").
 * Scoped by suiteOrgId (tenant isolation). Data lives in the SEPARATE customer schema,
 * NOT the scope-locked platform-admin schema.
 */
@Injectable()
export class CustomerCrmRepository {
  constructor(private readonly prisma: CustomerPrismaService) {}

  list(suiteOrgId: string) {
    return this.prisma.customerContact.findMany({
      where: { suiteOrgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(suiteOrgId: string, data: { name: string; email?: string; phone?: string }) {
    return this.prisma.customerContact.create({
      data: { suiteOrgId, name: data.name, email: data.email, phone: data.phone },
    });
  }
}
