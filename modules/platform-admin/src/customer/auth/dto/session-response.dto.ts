import { IsNumber, IsString } from 'class-validator';

/**
 * SessionResponseDto — response shape for /api/customer/v1/auth/* (Spec §5.1/§5.2).
 * Decorated for completeness (Spec §4.3); it is a RESPONSE DTO, so the
 * ValidationPipe does not run on it outbound, but the contract documents its fields.
 */
export class SessionResponseDto {
  @IsString()
  accessToken: string = '';

  @IsString()
  tokenType: 'Bearer' = 'Bearer';

  @IsNumber()
  expiresIn: number = 0;
}
