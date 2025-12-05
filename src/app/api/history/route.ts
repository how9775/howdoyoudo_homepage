import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('history')
      .select('id, year, date, description')
      .order('year', { ascending: false })
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch histories:', error);
    return NextResponse.json([], { status: 200 });
  }
}