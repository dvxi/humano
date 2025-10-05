/**
 * API Authentication Helpers
 *
 * Utilities for protecting API routes and checking permissions
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { hasPermission, canAccessUserData, type Permission, type UserRole } from './rbac';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Get the current session or throw an error
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new UnauthorizedError('Authentication required');
  }

  return {
    userId: session.user.id,
    role: (session.user.role as UserRole) || 'USER',
    email: session.user.email,
  };
}

/**
 * Require specific permission
 */
export async function requirePermission(permission: Permission) {
  const { userId, role } = await requireAuth();

  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }

  return { userId, role };
}

/**
 * Require access to specific user's data
 */
export async function requireUserAccess(targetUserId: string) {
  const { userId, role } = await requireAuth();

  if (!canAccessUserData(userId, targetUserId, role)) {
    throw new ForbiddenError('Cannot access this user data');
  }

  return { userId, role };
}

/**
 * Extract user ID from request (query param or body)
 */
export function extractUserId(request: NextRequest, body?: { userId?: string }): string | null {
  // Try query param first
  const url = new URL(request.url);
  const queryUserId = url.searchParams.get('userId');
  if (queryUserId) return queryUserId;

  // Try body
  if (body?.userId) return body.userId;

  return null;
}

/**
 * API error response helper
 */
export function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof ForbiddenError) {
    return Response.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
