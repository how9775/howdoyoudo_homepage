import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';

// GET - 모든 history 조회 (관리자용)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('history')
      .select('*')
      .order('year', { ascending: false })
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch histories:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - 새 history 추가
export async function POST(request: NextRequest) {
  try {
    const { year, date, description } = await request.json();

    if (!year || !date || !description) {
      return NextResponse.json(
        { error: 'Year, date, and description are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('history')
      .insert({ year, date, description })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: 'History created', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create history:', error);
    return NextResponse.json(
      { error: 'Failed to create history' },
      { status: 500 }
    );
  }
}
