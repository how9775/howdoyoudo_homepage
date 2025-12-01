import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // await 해서 실제 id 추출
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
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
}
