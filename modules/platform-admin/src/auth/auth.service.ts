import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { scrypt, timingSafeEqual, randomBytes } from 'crypto';
import { promisify } from 'util';
import { InternalUserRepository } from '../internal-users/internal-user.repository';
import { UserStatus } from '@prisma/client';

const scryptAsync = promisify(scrypt);

/**
 * AuthService — Operator Credential Validation
 *
 * Gate 4: enforce real credential verification at login.
 * Gate 10: dual-path login (env-var bootstrap + DB-backed invited users)
 *
 * Path 1 — OPERATOR_CREDENTIALS env var (existing bootstrap admin):
 *   email|salt:hash  (pipe-delimited, comma-separated for multiple)
 *   Takes priority if email found in env var.
 *
 * Path 2 — DB-stored passwordHash (Gate 10 invited internal users):
 *   InternalUser.passwordHash = "salt:hash" (scrypt, same format)
 *   Only reached if email NOT in OPERATOR_CREDENTIALS.
 *   Requires inviteStatus === 'active' (user completed set-password).
 *
 * Fail-closed rules:
 *   - email not in DB → 401
 *   - operator.status = deactivated → 401
 *   - email in env-var but hash mismatch → 401
 *   - email not in env-var AND no passwordHash → 401 (invite not redeemed)
 *   - email not in env-var AND passwordHash mismatch → 401
 *   - All failures: same generic 401 (no email-vs-password discrimination)
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly internalUserRepository: InternalUserRepository,
  ) {}

  /**
   * Validates operator credentials.
   * Returns the operator's DB id (UUID) on success, throws 401 on any failure.
   * Never logs the input password or the stored hash.
   */
  async validateCredentials(email: string, password: string): Promise<string> {
    // Always look up DB operator first (needed for status check regardless of path)
    const operator = await this.internalUserRepository.findByEmail(email);

    // Generic 401 if not in DB or deactivated
    if (!operator || operator.status === UserStatus.deactivated) {
      await this.dummyVerify();
      throw new UnauthorizedException('Unauthorized');
    }

    // Load OPERATOR_CREDENTIALS env var
    const credsRaw = process.env.OPERATOR_CREDENTIALS ?? '';
    const credsMap: Record<string, string> = {};
    for (const entry of credsRaw.split(',')) {
      const pipeIdx = entry.indexOf('|');
      if (pipeIdx > 0) {
        const entryEmail = entry.substring(0, pipeIdx).trim();
        const entryHash  = entry.substring(pipeIdx + 1).trim();
        credsMap[entryEmail] = entryHash;
      }
    }

    const storedEntry = credsMap[email] ?? null;

    if (storedEntry) {
      // ── Path 1: OPERATOR_CREDENTIALS env var (bootstrap admin, unchanged) ──
      const [saltHex, hashHex] = storedEntry.split(':');
      if (!saltHex || !hashHex) {
        this.logger.warn('OPERATOR_CREDENTIALS entry has invalid format — login denied');
        throw new UnauthorizedException('Unauthorized');
      }

      const salt = Buffer.from(saltHex, 'hex');
      const storedHash = Buffer.from(hashHex, 'hex');
      const inputHash = (await scryptAsync(password, salt, 64)) as Buffer;

      if (storedHash.length !== inputHash.length) {
        throw new UnauthorizedException('Unauthorized');
      }
      if (!timingSafeEqual(storedHash, inputHash)) {
        throw new UnauthorizedException('Unauthorized');
      }

      return operator.id;
    }

    // ── Path 2: DB-backed invited internal user (Gate 10) ───────────────────
    // Requires passwordHash (invite must have been redeemed already)
    if (!operator.passwordHash) {
      await this.dummyVerify(); // timing parity even if no hash
      throw new UnauthorizedException('Unauthorized');
    }

    const [saltHex, hashHex] = operator.passwordHash.split(':');
    if (!saltHex || !hashHex) {
      await this.dummyVerify();
      throw new UnauthorizedException('Unauthorized');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const storedHash = Buffer.from(hashHex, 'hex');
    const inputHash = (await scryptAsync(password, salt, 64)) as Buffer;

    if (storedHash.length !== inputHash.length) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (!timingSafeEqual(storedHash, inputHash)) {
      throw new UnauthorizedException('Unauthorized');
    }

    return operator.id;
  }

  /**
   * Dummy verification to preserve constant-time behavior on fast-reject paths.
   */
  private async dummyVerify(): Promise<void> {
    const fakeSalt = randomBytes(16);
    const fakeHash = Buffer.alloc(64);
    const inputHash = (await scryptAsync('dummy', fakeSalt, 64)) as Buffer;
    timingSafeEqual(fakeHash, inputHash.length === 64 ? inputHash : fakeHash);
  }
}
