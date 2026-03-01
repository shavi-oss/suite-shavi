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
 *
 * Password storage: env-var OPERATOR_CREDENTIALS (JSON map email→"salt:hash").
 * Hash algorithm: scrypt(password, salt, 64) → hex. N=16384, r=8, p=1 (Node defaults).
 * Compare: crypto.timingSafeEqual (constant-time; prevents timing attacks).
 *
 * Fail-closed rules:
 *   - OPERATOR_CREDENTIALS not set   → 401 (no fallback, no default password)
 *   - email not in credentials map   → 401
 *   - operator not in DB             → 401
 *   - operator.status = deactivated  → 401
 *   - password hash mismatch         → 401
 *   - All failures: same generic 401 (no email-vs-password discrimination)
 *
 * Evidence: Gate 4 forensic-cred/01_CODE_TRUTH.md
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly internalUserRepository: InternalUserRepository,
  ) {}

  /**
   * Validates operator credentials against DB record + env-stored password hash.
   * Returns the operator's DB id (UUID) on success, throws 401 on any failure.
   * Never logs the input password or the stored hash.
   *
   * @param email    — from LoginDto.email
   * @param password — from LoginDto.password (plaintext input to verify)
   * @returns operator.id (UUID string) — to be stored as session userId
   */
  async validateCredentials(email: string, password: string): Promise<string> {
    // Load credentials map from env — fail-closed if missing.
    const credsRaw = process.env.OPERATOR_CREDENTIALS;
    if (!credsRaw) {
      // STOP: env var not configured. Fail-closed — deny all logins.
      this.logger.warn('OPERATOR_CREDENTIALS env var not set — all logins denied');
      throw new UnauthorizedException('Unauthorized');
    }

    let credsMap: Record<string, string>;
    try {
      credsMap = JSON.parse(credsRaw);
    } catch {
      this.logger.warn('OPERATOR_CREDENTIALS env var is not valid JSON — all logins denied');
      throw new UnauthorizedException('Unauthorized');
    }

    // Constant-time presence check — always look up hash AND operator to avoid timing leaks.
    const storedEntry = credsMap[email] ?? null;

    // DB lookup — must exist and be active regardless of password match.
    const operator = await this.internalUserRepository.findByEmail(email);

    // Generic 401 for: email not in creds map, not in DB, or deactivated.
    // Same error message for all failure modes — no enumeration.
    if (!storedEntry || !operator || operator.status === UserStatus.deactivated) {
      // Run a dummy verification to preserve constant-time behavior even on negative path.
      await this.dummyVerify();
      throw new UnauthorizedException('Unauthorized');
    }

    // Hash format: "<hex-salt>:<hex-hash>"
    const [saltHex, hashHex] = storedEntry.split(':');
    if (!saltHex || !hashHex) {
      this.logger.warn('OPERATOR_CREDENTIALS entry has invalid format — login denied');
      throw new UnauthorizedException('Unauthorized');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const storedHash = Buffer.from(hashHex, 'hex');

    // Derive hash from input password using same parameters.
    const inputHash = (await scryptAsync(password, salt, 64)) as Buffer;

    // Constant-time compare — must have same length or timingSafeEqual throws.
    if (storedHash.length !== inputHash.length) {
      throw new UnauthorizedException('Unauthorized');
    }

    const match = timingSafeEqual(storedHash, inputHash);
    if (!match) {
      throw new UnauthorizedException('Unauthorized');
    }

    return operator.id;
  }

  /**
   * Dummy verification to preserve constant-time behavior on fast-reject paths.
   * Prevents timing attacks that could distinguish "user not found" from "wrong password".
   */
  private async dummyVerify(): Promise<void> {
    const fakeSalt = randomBytes(16);
    const fakeHash = Buffer.alloc(64);
    const inputHash = (await scryptAsync('dummy', fakeSalt, 64)) as Buffer;
    // Result is discarded — this call exists only for timing parity.
    timingSafeEqual(fakeHash, inputHash.length === 64 ? inputHash : fakeHash);
  }
}
