/**
 * Platform Admin Module — Fail-Closed Enforcement
 * 
 * GATE 4.5 — DENY-ALL BY DEFAULT
 * DenyAllGuard wired as APP_GUARD for fail-closed enforcement.
 * NO controllers, NO routes, NO features.
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DenyAllGuard } from './guards';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: DenyAllGuard,
    },
  ],
})
export class PlatformAdminModule {}
