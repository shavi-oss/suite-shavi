/**
 * PlatformAdminModule Tests — platform-admin
 *
 * GATE 4.8 — MODULE WIRING TESTS
 * Tests for fail-closed enforcement via APP_GUARD.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { PlatformAdminModule } from '../../../platform-admin.module';
import { DenyAllGuard } from '../../../guards/deny-all.guard';

describe('PlatformAdminModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PlatformAdminModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('fail-closed enforcement', () => {
    it('should have APP_GUARD provider configured', () => {
      const providers = Reflect.getMetadata('providers', PlatformAdminModule) || [];
      const appGuardProvider = providers.find((p: any) => 
        p && typeof p === 'object' && p.provide === APP_GUARD
      );
      expect(appGuardProvider).toBeDefined();
      expect(appGuardProvider.useClass).toBe(DenyAllGuard);
    });
  });

  describe('module compilation', () => {
    it('should compile successfully', () => {
      expect(module).toBeDefined();
    });
  });
});

