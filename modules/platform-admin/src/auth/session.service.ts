import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface SessionData {
  userId: string;
  expiresAt: number;
}

@Injectable()
export class SessionService {
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_DURATION_MS = 900000; // 15 minutes

  createSession(userId: string): string {
    const sessionId = randomUUID();
    const expiresAt = Date.now() + this.SESSION_DURATION_MS;

    this.sessions.set(sessionId, {
      userId,
      expiresAt,
    });

    return sessionId;
  }

  validateSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session.userId;
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
