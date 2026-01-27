/**
 * Deny All Guard — Hard Fail-Closed
 * 
 * GATE 4.1 — FAIL-CLOSED GUARD
 * Always denies access. No conditions. No configuration.
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class DenyAllGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return false;
  }
}
