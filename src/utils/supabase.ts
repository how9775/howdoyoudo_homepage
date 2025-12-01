// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 서버 사이드용 클라이언트 (admin 권한)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 클라이언트 사이드용
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection - async 함수로 변경
if (typeof window === 'undefined') {
  (async () => {
    try {
      const { error } = await supabaseAdmin
        .from('admins')
        .select('count')
        .limit(1)
      
      if (error) throw error
      console.log('✅ Supabase connected successfully')
    } catch (err) {
      console.error('❌ Supabase connection failed:', err)
    }
  })()
}

// Helper function
export async function query<T = any>(tableName: string, options?: {
  select?: string
  where?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }[]
  limit?: number
}): Promise<T[]> {
  try {
    let queryBuilder = supabaseAdmin.from(tableName).select(options?.select || '*')

    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value)
      })
    }

    if (options?.orderBy) {
      options.orderBy.forEach(order => {
        queryBuilder = queryBuilder.order(order.column, { ascending: order.ascending ?? true })
      })
    }

    if (options?.limit) {
      queryBuilder = queryBuilder.limit(options.limit)
    }

    const { data, error } = await queryBuilder

    if (error) throw error
    return (data as T[]) || []
  } catch (error) {
    console.error('Supabase query error:', error)
    throw error
  }
}

// Single row helper
export async function queryOne<T = any>(tableName: string, options?: {
  select?: string
  where?: Record<string, any>
}): Promise<T | null> {
  try {
    let queryBuilder = supabaseAdmin.from(tableName).select(options?.select || '*')

    if (options?.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value)
      })
    }

    const { data, error } = await queryBuilder.single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }

    return data as T
  } catch (error) {
    console.error('Supabase query error:', error)
    return null
  }
}