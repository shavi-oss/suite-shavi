/**
 * Explicit Allow Guard — Opt-In Override
 * 
 * GATE 4.9 — FIRST OPT-IN ENDPOINT
 * Always allows access. Used ONLY for explicit opt-in routes.
 * MUST NOT be used on multiple routes without governance approval.
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ExplicitAllowGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
