export type Resource = 'organization';

export type Action = 
  | 'read:list'
  | 'read:byId'
  | 'write:create'
  | 'write:update'
  | 'write:delete';

export type PolicyMap = Map<string, boolean>;
