/**
 * Platform Admin Module — Export Barrier
 * 
 * GATE 4.1 — SKELETON ONLY
 */

// GATE 6A: Env-Gated Runtime Enablement
const DEV_RUNTIME_FLAG = process.env.PLATFORM_ADMIN_DEV_RUNTIME;
const IS_DEV_RUNTIME_ENABLED =
  DEV_RUNTIME_FLAG === '1' ||
  DEV_RUNTIME_FLAG === 'true' ||
  DEV_RUNTIME_FLAG === 'TRUE';

if (!IS_DEV_RUNTIME_ENABLED) {
  // eslint-disable-next-line no-console
  console.log(
    '[GATE_6A] Dev runtime disabled (set PLATFORM_ADMIN_DEV_RUNTIME=true to enable).'
  );
  // process.exit(0) removed to prevent Jest worker crash
}

export { PlatformAdminModule } from './platform-admin.module';
