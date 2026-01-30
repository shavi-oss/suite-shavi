/**
 * Health Response DTO — platform-admin
 * 
 * GATE 4.9 — HEALTH ENDPOINT
 * Response schema for health check endpoint.
 */

export interface HealthResponseDto {
  status: 'ok';
  module: 'platform-admin';
  timestamp: string;
}
