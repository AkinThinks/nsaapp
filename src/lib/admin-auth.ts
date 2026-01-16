/**
 * Admin Auth - Server-only code
 * For client-safe utilities, import from './admin-auth-client'
 */
import { cookies } from 'next/headers'
import { createServerClient } from './supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash } from 'crypto'

// Re-export client-safe utilities for convenience in server components
export {
  type AdminRole,
  type Permission,
  PERMISSIONS,
  hasPermission,
  getPermissionsForRole,
  maskPhone,
  getRoleBadgeColor,
  getRoleLabel,
} from './admin-auth-client'

import { type AdminRole, type Permission, hasPermission } from './admin-auth-client'

// =============================================
// SERVER-ONLY TYPES
// =============================================

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: AdminRole
  is_active: boolean
  last_login: string | null
  created_at: string
}

export interface AdminSession {
  adminId: string
  email: string
  role: AdminRole
  fullName: string
}

// =============================================
// PASSWORD HELPERS
// =============================================

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// =============================================
// JWT HELPERS
// =============================================

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-in-production'
const JWT_EXPIRY = '24h'

export function generateToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// =============================================
// SESSION MANAGEMENT
// =============================================

const COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 24 * 60 * 60 // 24 hours in seconds

export async function createSession(
  admin: AdminUser,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const supabase = createServerClient()

  const session: AdminSession = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    fullName: admin.full_name,
  }

  const token = generateToken(session)
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000)

  // Store session in database
  await supabase.from('admin_sessions').insert({
    admin_id: admin.id,
    token_hash: tokenHash,
    ip_address: ipAddress,
    user_agent: userAgent,
    expires_at: expiresAt.toISOString(),
  })

  // Update last login
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', admin.id)

  return token
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSessionFromCookie(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const session = verifyToken(token)
  if (!session) return null

  // Verify session exists in database and is not expired
  const supabase = createServerClient()
  const tokenHash = hashToken(token)

  const { data: dbSession } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!dbSession) return null

  return session
}

export async function invalidateSession(token: string) {
  const supabase = createServerClient()
  const tokenHash = hashToken(token)

  await supabase
    .from('admin_sessions')
    .delete()
    .eq('token_hash', tokenHash)
}

export async function invalidateAllSessions(adminId: string) {
  const supabase = createServerClient()

  await supabase
    .from('admin_sessions')
    .delete()
    .eq('admin_id', adminId)
}

// =============================================
// ADMIN USER OPERATIONS
// =============================================

export async function getAdminByEmail(email: string): Promise<(AdminUser & { password_hash: string }) | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active, last_login, created_at')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export async function createAdmin(
  data: {
    email: string
    password: string
    full_name: string
    role: AdminRole
  },
  createdBy?: string
): Promise<AdminUser | null> {
  const supabase = createServerClient()

  const passwordHash = await hashPassword(data.password)

  const { data: admin, error } = await supabase
    .from('admin_users')
    .insert({
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      full_name: data.full_name,
      role: data.role,
      created_by: createdBy,
    })
    .select('id, email, full_name, role, is_active, last_login, created_at')
    .single()

  if (error || !admin) return null
  return admin
}

// =============================================
// AUDIT LOGGING
// =============================================

export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  options?: {
    entityType?: string
    entityId?: string
    details?: Record<string, unknown>
    ipAddress?: string
  }
) {
  const supabase = createServerClient()

  await supabase.from('admin_audit_logs').insert({
    admin_id: adminId,
    admin_email: adminEmail,
    action,
    entity_type: options?.entityType,
    entity_id: options?.entityId,
    details: options?.details,
    ip_address: options?.ipAddress,
  })
}

// =============================================
// MIDDLEWARE HELPER
// =============================================

export async function requireAdmin(requiredPermission?: Permission): Promise<{
  success: boolean
  admin?: AdminSession
  error?: string
  status?: number
}> {
  const session = await getSessionFromCookie()

  if (!session) {
    return { success: false, error: 'Unauthorized', status: 401 }
  }

  if (requiredPermission && !hasPermission(session.role, requiredPermission)) {
    return { success: false, error: 'Forbidden', status: 403 }
  }

  return { success: true, admin: session }
}
