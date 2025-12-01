import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';

// PUT - history 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { year, date, description } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('history')
      .update({ year, date, description })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'History not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'History updated', data });
  } catch (error) {
    console.error('Failed to update history:', error);
    return NextResponse.json(
      { error: 'Failed to update history' },
      { status: 500 }
    );
  }
}

// DELETE - history 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('history')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'History not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'History deleted' });
  } catch (error) {
    console.error('Failed to delete history:', error);
    return NextResponse.json(
      { error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}
