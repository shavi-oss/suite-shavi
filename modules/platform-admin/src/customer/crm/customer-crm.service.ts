import { Injectable } from '@nestjs/common';
import { CustomerCrmRepository } from './customer-crm.repository';

@Injectable()
export class CustomerCrmService {
  constructor(private readonly repo: CustomerCrmRepository) {}

  list(suiteOrgId: string) {
    return this.repo.list(suiteOrgId);
  }

  create(suiteOrgId: string, dto: { name: string; email?: string; phone?: string }) {
    return this.repo.create(suiteOrgId, dto);
  }
}
