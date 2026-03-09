-- Gate 10: Add invite + credential lifecycle fields to internal_users
-- CreateEnum InviteStatus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InviteStatus') THEN
    CREATE TYPE "public"."InviteStatus" AS ENUM ('pending', 'invited', 'active', 'expired');
  END IF;
END$$;

-- Add invite fields to internal_users table
ALTER TABLE "public"."internal_users"
  ADD COLUMN IF NOT EXISTS "passwordHash"    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "inviteTokenHash" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "inviteExpiresAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "inviteStatus"    "public"."InviteStatus" NOT NULL DEFAULT 'pending';

-- Add invite + redeem to ActionType enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'invite' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ActionType')) THEN
    ALTER TYPE "public"."ActionType" ADD VALUE 'invite';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'redeem' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ActionType')) THEN
    ALTER TYPE "public"."ActionType" ADD VALUE 'redeem';
  END IF;
END$$;

-- Change performedBy column type from UUID to VARCHAR(255) for redeem audit compatibility
ALTER TABLE "public"."platform_admin_audit_logs"
  ALTER COLUMN "performedBy" TYPE VARCHAR(255);
