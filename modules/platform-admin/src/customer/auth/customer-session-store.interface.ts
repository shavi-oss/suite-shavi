/**
 * Session store abstraction (F1 remediation).
 *
 * The Workspace Session JWT is stateless, but the Kernel (Core) access token it
 * wraps MUST stay server-side and be invalidable (logout / expiry). This store
 * holds that server-side record.
 *
 * Two implementations:
 *  - MemorySessionStore: in-process Map + TTL sweep. Safe fallback (fixes the
 *    unbounded-memory leak), but NOT shared across Suite replicas.
 *  - RedisSessionStore: shared, TTL-backed. Required for horizontal scaling.
 *
 * Selection happens in CustomerModule via REDIS_URL (see customer.module.ts).
 */

export interface SessionRecord {
  userId: string;
  email: string;
  organizationId: string;
  /** Core user-scoped accessToken — NEVER returned to the client. */
  kernelToken: string;
}

export interface SessionStore {
  set(jti: string, record: SessionRecord, ttlSec: number): Promise<void>;
  get(jti: string): Promise<SessionRecord | null>;
  delete(jti: string): Promise<void>;
  close(): Promise<void>;
}
