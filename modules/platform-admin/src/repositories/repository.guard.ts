import { DataAccessPolicy } from '../policy/data-access.policy';
import { Resource, Action } from '../policy/policy.types';

export function enforcePolicy(resource: Resource, action: Action): void {
  DataAccessPolicy.enforce(resource, action);
}
