import { Logger } from '@nestjs/common';
import { SessionRecord, SessionStore } from './customer-session-store.interface';

interface Entry {
  record: SessionRecord;
  expiresAt: number; // epoch ms
}

/**
 * In-process session store with TTL eviction (F1 remediation, fallback path).
 *
 * Fixes the original unbounded `Map` leak: entries are lazily expired on read
 * AND swept periodically. NOT shared across replicas — use RedisSessionStore
 * when REDIS_URL is configured.
 */
export class MemorySessionStore implements SessionStore {
  private readonly logger = new Logger(MemorySessionStore.name);
  private readonly map = new Map<string, Entry>();
  private readonly sweep: NodeJS.Timeout;

  constructor(sweepIntervalMs = 60_000) {
    this.sweep = setInterval(() => this.evictExpired(), sweepIntervalMs);
    // Never keep the process alive solely for the sweep timer.
    this.sweep.unref?.();
  }

  async set(jti: string, record: SessionRecord, ttlSec: number): Promise<void> {
    this.map.set(jti, { record, expiresAt: Date.now() + ttlSec * 1000 });
  }

  async get(jti: string): Promise<SessionRecord | null> {
    const entry = this.map.get(jti);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.map.delete(jti);
      return null;
    }
    return entry.record;
  }

  async delete(jti: string): Promise<void> {
    this.map.delete(jti);
  }

  async close(): Promise<void> {
    clearInterval(this.sweep);
    this.map.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [jti, entry] of this.map) {
      if (entry.expiresAt <= now) this.map.delete(jti);
    }
  }
}
