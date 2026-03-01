/**
 * Deny All Guard — Reflector-Aware Fail-Closed
 *
 * GATE 4.1 — FAIL-CLOSED GUARD
 * Denies access by default. Passes ONLY routes explicitly marked with IS_EXPLICIT_ALLOW.
 * Uses NestJS Reflector to check handler/class metadata set by @ExplicitAllow() decorator.
 *
 * Pattern: industry-standard NestJS fail-closed with explicit opt-in.
 * Evidence: forensic-auth-session Phase 2 — DenyAllGuard reflector fix.
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_EXPLICIT_ALLOW } from './explicit-allow.guard';

@Injectable()
export class DenyAllGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route handler or controller class has IS_EXPLICIT_ALLOW metadata.
    // getAllAndOverride: checks handler first (most specific), then controller class.
    const isExplicitAllow = this.reflector.getAllAndOverride<boolean>(
      IS_EXPLICIT_ALLOW,
      [context.getHandler(), context.getClass()],
    );

    // Fail-closed: only allow if explicitly opted in.
    return isExplicitAllow === true;
  }
}
