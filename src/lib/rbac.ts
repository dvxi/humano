/**
 * Role-Based Access Control (RBAC)
 *
 * Utilities for checking user permissions and roles
 */

export type UserRole = 'USER' | 'TRAINER' | 'ADMIN';

export type Permission =
  | 'profile:read'
  | 'profile:write'
  | 'workouts:read'
  | 'workouts:write'
  | 'metrics:read'
  | 'metrics:write'
  | 'trainers:read'
  | 'trainers:write'
  | 'trainers:manage'
  | 'users:read'
  | 'users:manage'
  | 'integrations:read'
  | 'integrations:write'
  | 'reminders:read'
  | 'reminders:write'
  | 'subscriptions:read'
  | 'subscriptions:write';

/**
 * Role-based permissions matrix
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  USER: [
    'profile:read',
    'profile:write',
    'workouts:read',
    'workouts:write',
    'metrics:read',
    'metrics:write',
    'trainers:read',
    'integrations:read',
    'integrations:write',
    'reminders:read',
    'reminders:write',
    'subscriptions:read',
    'subscriptions:write',
  ],
  TRAINER: [
    'profile:read',
    'profile:write',
    'workouts:read',
    'workouts:write',
    'metrics:read',
    'metrics:write',
    'trainers:read',
    'trainers:write',
    'users:read',
    'integrations:read',
    'integrations:write',
    'reminders:read',
    'reminders:write',
    'subscriptions:read',
    'subscriptions:write',
  ],
  ADMIN: [
    'profile:read',
    'profile:write',
    'workouts:read',
    'workouts:write',
    'metrics:read',
    'metrics:write',
    'trainers:read',
    'trainers:write',
    'trainers:manage',
    'users:read',
    'users:manage',
    'integrations:read',
    'integrations:write',
    'reminders:read',
    'reminders:write',
    'subscriptions:read',
    'subscriptions:write',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

/**
 * Check if a user can access another user's data
 * Users can only access their own data unless they're a trainer or admin
 */
export function canAccessUserData(
  currentUserId: string,
  targetUserId: string,
  role: UserRole
): boolean {
  // Users can always access their own data
  if (currentUserId === targetUserId) {
    return true;
  }

  // Trainers and admins can access other users' data
  return role === 'TRAINER' || role === 'ADMIN';
}
