import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * LoginDto — request body for POST /api/customer/v1/auth/session.
 * Validated by the customer-scoped ValidationPipe (Spec §4.3 / ADR-016 D3).
 */
export class LoginDto {
  @IsEmail()
  email: string = '';

  @IsString()
  @MinLength(8)
  password: string = '';
}
