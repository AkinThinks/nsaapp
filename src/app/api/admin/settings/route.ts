import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

// Get all settings
export async function GET() {
  const auth = await requireAdmin('manage_settings')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = createServerClient()

  const { data: settings, error } = await supabase
    .from('system_settings')
    .select('key, value, description')
    .order('key')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Parse JSON values
  const parsedSettings = settings?.map((s) => ({
    key: s.key,
    value: typeof s.value === 'string' ? s.value : JSON.stringify(s.value),
    description: s.description,
  }))

  return NextResponse.json({ settings: parsedSettings })
}

// Update settings
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin('manage_settings')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { settings } = body

  if (!settings || !Array.isArray(settings)) {
    return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Update each setting
  for (const setting of settings) {
    const { error } = await supabase
      .from('system_settings')
      .update({
        value: setting.value,
        updated_by: auth.admin.adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('key', setting.key)

    if (error) {
      return NextResponse.json(
        { error: `Failed to update ${setting.key}` },
        { status: 500 }
      )
    }
  }

  // Log action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, 'update_settings', {
    details: { updatedKeys: settings.map((s: { key: string }) => s.key) },
    ipAddress,
  })

  return NextResponse.json({ success: true })
}
