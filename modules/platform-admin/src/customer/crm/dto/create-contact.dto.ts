import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * CreateContactDto — request body for POST /api/customer/v1/crm/contacts.
 * Validated by the customer-scoped ValidationPipe (Spec §4.3 / ADR-016 D3).
 */
export class CreateContactDto {
  @IsString()
  @MinLength(1)
  name: string = '';

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
