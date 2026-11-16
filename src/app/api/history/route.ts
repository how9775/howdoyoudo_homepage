import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';

// 공개 연혁: 일자 desc → 시간 desc(없으면 뒤) → 등록순(id) desc
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('history')
      .select('id, year, date, description, event_date, event_time')
      .order('event_date', { ascending: false })
      .order('event_time', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch histories:', error);
    return NextResponse.json([], { status: 200 });
  }
}
