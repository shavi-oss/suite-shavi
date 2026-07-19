import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { CustomerKernelException } from './customer-kernel.exception';

/**
 * Standardized Customer Gateway error envelope (Spec §4.1 / ADR-016 D3).
 *
 * Every error thrown inside a /api/customer/v1/* request is serialized into:
 *   { "error": { "code": "CUSTOMER_*", "message": "<safe>",
 *                "requestId": "c-<uuid>", "details": null | [...] } }
 *
 * HARD RULE (CONFLICT_RULES #6 / Contract B Stop Rules / Contract A §5.3):
 *  - The response body and the logs MUST NOT contain: tokens, secrets, raw
 *    upstream error.message, or stack traces.
 *  - CUSTOMER_KERNEL_ERROR / CUSTOMER_INTERNAL use GENERIC messages only.
 */
export interface CustomerErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
    details: unknown;
  };
}

interface MappedError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  safeLog: Record<string, unknown>;
}

@Catch()
export class CustomerAllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomerAllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = `c-${randomUUID()}`;

    const mapped = this.mapError(exception);

    // SAFE LOG: only the error code + non-sensitive routing fields.
    // NEVER log exception.message (may carry raw upstream error), stack, or token.
    this.logger.error({
      message: 'Customer request error',
      requestId,
      code: mapped.code,
      method: req?.method,
      path: req?.url,
      ...mapped.safeLog,
    });

    const envelope: CustomerErrorEnvelope = {
      error: {
        code: mapped.code,
        message: mapped.message,
        requestId,
        details: mapped.details ?? null,
      },
    };

    res.status(mapped.status).json(envelope);
  }

  private mapError(exception: unknown): MappedError {
    // Typed broker failure → 502 generic.
    if (exception instanceof CustomerKernelException) {
      return {
        status: 502,
        code: 'CUSTOMER_KERNEL_ERROR',
        message: 'Upstream service unavailable',
        safeLog: { operation: exception.operation },
      };
    }

    if (exception instanceof UnauthorizedException) {
      return {
        status: 401,
        code: 'CUSTOMER_UNAUTHORIZED',
        message: this.safeMessage(exception, 'Authentication required'),
        safeLog: {},
      };
    }

    if (exception instanceof ForbiddenException) {
      return {
        status: 403,
        code: 'CUSTOMER_FORBIDDEN',
        message: this.safeMessage(exception, 'Insufficient permission'),
        safeLog: {},
      };
    }

    if (exception instanceof BadRequestException) {
      return {
        status: 400,
        code: 'CUSTOMER_BAD_REQUEST',
        message: 'Validation failed',
        details: this.extractValidationDetails(exception),
        safeLog: {},
      };
    }

    if (exception instanceof NotFoundException) {
      return {
        status: 404,
        code: 'CUSTOMER_NOT_FOUND',
        message: this.safeMessage(exception, 'Resource not found'),
        safeLog: {},
      };
    }

    if (exception instanceof ConflictException) {
      return {
        status: 409,
        code: 'CUSTOMER_CONFLICT',
        message: this.safeMessage(exception, 'Resource already exists'),
        safeLog: {},
      };
    }

    if (exception instanceof HttpException) {
      // Any other known HTTP exception surfaces as INTERNAL with a generic body
      // (do NOT forward the raw Nest message which may leak internals).
      return {
        status: exception.getStatus(),
        code: 'CUSTOMER_INTERNAL',
        message: 'Internal error',
        safeLog: { status: exception.getStatus() },
      };
    }

    // Unknown / bare Error — generic, never forward e.message.
    return {
      status: 500,
      code: 'CUSTOMER_INTERNAL',
      message: 'Internal error',
      safeLog: {},
    };
  }

  /**
   * For expected client errors we control the message text (e.g.
   * "Missing customer session token"), so it is safe to surface — but we still
   * guard against accidentally-forwarded long/PII-laden strings by falling back
   * to the generic message when the source message is empty or suspiciously long.
   */
  private safeMessage(exception: HttpException, fallback: string): string {
    const msg = exception.message;
    if (typeof msg === 'string' && msg.length > 0 && msg.length <= 200) {
      return msg;
    }
    return fallback;
  }

  /** Extract field-level validation details from a ValidationPipe BadRequestException. */
  private extractValidationDetails(exception: BadRequestException): unknown[] {
    const res = exception.getResponse();
    const raw = typeof res === 'object' && res !== null ? (res as any).message : null;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map((entry) => {
      const str = typeof entry === 'string' ? entry : String(entry);
      const spaceIdx = str.indexOf(' ');
      const field = spaceIdx === -1 ? '_' : str.slice(0, spaceIdx);
      const detail = spaceIdx === -1 ? str : str.slice(spaceIdx + 1);
      return { field, message: detail };
    });
  }
}
