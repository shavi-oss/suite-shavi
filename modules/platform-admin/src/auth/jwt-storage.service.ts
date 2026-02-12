import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStorageService {
  private jwtStore: Map<string, string> = new Map();

  set(userId: string, coreJwt: string): void {
    this.jwtStore.set(userId, coreJwt);
  }

  get(userId: string): string | null {
    return this.jwtStore.get(userId) || null;
  }

  clear(userId: string): void {
    this.jwtStore.delete(userId);
  }
}
