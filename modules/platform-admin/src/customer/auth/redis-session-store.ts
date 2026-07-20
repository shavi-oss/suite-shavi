import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { SessionRecord, SessionStore } from './customer-session-store.interface';

const KEY_PREFIX = 'shavi:sess:';

/**
 * Redis-backed session store (F1 remediation, scale path).
 *
 * Shared across all Suite replicas; entries auto-expire via Redis `EX`.
 * Key prefix `shavi:sess:` isolates Workspace sessions from other Redis users
 * (e.g. the Bassan Kernel's own keys on a shared `bassan-core-redis`).
 */
export class RedisSessionStore implements SessionStore {
  private readonly logger = new Logger(RedisSessionStore.name);
  private readonly client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
    });
    this.client.on('error', (err: Error) => {
      // Fail-closed: connection issues must not crash the process; downstream
      // verify() will deny (store miss) rather than expose a stale session.
      this.logger.error({ message: 'Redis session store error', error: err.message });
    });
  }

  async set(jti: string, record: SessionRecord, ttlSec: number): Promise<void> {
    await this.client.set(KEY_PREFIX + jti, JSON.stringify(record), 'EX', ttlSec);
  }

  async get(jti: string): Promise<SessionRecord | null> {
    const raw = await this.client.get(KEY_PREFIX + jti);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionRecord;
    } catch {
      return null;
    }
  }

  async delete(jti: string): Promise<void> {
    await this.client.del(KEY_PREFIX + jti);
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
