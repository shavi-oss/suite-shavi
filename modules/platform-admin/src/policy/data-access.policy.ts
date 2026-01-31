import { PolicyMap, Resource, Action } from './policy.types';

export class DataAccessPolicy {
  private static policyMap: PolicyMap = new Map([
    ['organization:read:list', true],
    ['organization:read:byId', true],
    ['organization:write:create', false],
    ['organization:write:update', false],
    ['organization:write:delete', false],
  ]);

  static isAllowed(resource: Resource, action: Action): boolean {
    const key = `${resource}:${action}`;
    return this.policyMap.get(key) ?? false;
  }

  static enforce(resource: Resource, action: Action): void {
    if (!this.isAllowed(resource, action)) {
      throw new Error(`POLICY_DENIED: ${resource}:${action}`);
    }
  }
}
