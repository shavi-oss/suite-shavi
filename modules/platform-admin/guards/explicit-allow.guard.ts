/**
 * Explicit Allow Guard — Opt-In Metadata Decorator
 *
 * GATE 4.9 — FIRST OPT-IN ENDPOINT
 * Sets IS_EXPLICIT_ALLOW metadata on a route handler or controller.
 * DenyAllGuard (APP_GUARD) reads this metadata via Reflector.
 * Routes marked with @ExplicitAllow() pass through DenyAllGuard.
 *
 * MUST NOT be used on multiple routes without governance approval.
 * Evidence: forensic-auth-session Phase 2 — ExplicitAllowGuard redesign as SetMetadata.
 */

import { SetMetadata } from '@nestjs/common';

export const IS_EXPLICIT_ALLOW = 'IS_EXPLICIT_ALLOW';

/**
 * Decorator to mark a route as explicitly allowed through DenyAllGuard.
 * Use on method handlers or controller classes that have downstream guards
 * (SessionGuard, RbacGuard) to enforce their own auth requirements.
 */
export const ExplicitAllow = () => SetMetadata(IS_EXPLICIT_ALLOW, true);

/**
 * @deprecated Use @ExplicitAllow() decorator instead.
 * Kept for backward compatibility with existing UseGuards(ExplicitAllowGuard) usages.
 * Can be removed once all controllers are migrated to @ExplicitAllow().
 */
export class ExplicitAllowGuard {
  canActivate(): boolean {
    return true;
  }
}
