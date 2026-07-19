import { Injectable } from '@nestjs/common';
import { CustomerCrmRepository } from './customer-crm.repository';

/**
 * CRM contact list item — Spec §5.5 envelope item shape.
 */
export interface CrmContactListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

/**
 * CRM contact list envelope — Spec §5.5 `{ items, total }`.
 */
export interface CrmContactListResult {
  items: CrmContactListItem[];
  total: number;
}

/**
 * CRM contact created payload — Spec §5.6 exact shape.
 * NOTE: the internal tenant column is `suiteOrgId`; the Workspace contract
 * exposes it as `organizationId` (Spec §5.6). We map here, server-side, and
 * NEVER expose `suiteOrgId` to the client.
 */
export interface CrmContactCreated {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  organizationId: string;
  createdAt: Date | string;
}

@Injectable()
export class CustomerCrmService {
  constructor(private readonly repo: CustomerCrmRepository) {}

  /**
   * List contacts for a tenant (suiteOrgId). Returns the Spec §5.5 envelope
   * `{ items, total }` so the contract shape is enforced at the service边界
   * (boundary) and cannot leak a raw Prisma array to the controller/response.
   */
  async list(suiteOrgId: string): Promise<CrmContactListResult> {
    const rows = await this.repo.list(suiteOrgId);
    // Project to the Spec §5.5 item shape and NEVER expose the internal
    // suiteOrgId tenant column to the client.
    const items = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
    }));
    return { items, total: rows.length };
  }

  /**
   * Create a contact. Returns the Spec §5.6 exact payload, mapping the internal
   * `suiteOrgId` column to the contract's `organizationId` field and keeping
   * `createdAt`. The raw `suiteOrgId` key is never returned to the client.
   */
  async create(
    suiteOrgId: string,
    dto: { name: string; email?: string; phone?: string },
  ): Promise<CrmContactCreated> {
    const row = await this.repo.create(suiteOrgId, dto);
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      organizationId: row.suiteOrgId,
      createdAt: row.createdAt,
    };
  }
}
