import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/utils/supabase';
import { verifyToken } from '@/lib/jwt';
import {
  formatHistoryLabel,
  isValidEventDate,
  normalizeEventTime,
  yearOf,
} from '@/lib/historyUtils';

function isAuthorized(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && !!verifyToken(token);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const eventDate = body.eventDate;
    const eventTime = normalizeEventTime(body.eventTime);

    if (!isValidEventDate(eventDate) || !description) {
      return NextResponse.json(
        { error: '일자(YYYY-MM-DD)와 설명은 필수입니다.' },
        { status: 400 }
      );
    }
    if (eventTime === undefined) {
      return NextResponse.json({ error: '시간 형식이 올바르지 않습니다. (HH:mm)' }, { status: 400 });
    }

    const { data: current, error: fetchError } = await supabaseAdmin
      .from('history')
      .select('event_date')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!current) {
      return NextResponse.json({ error: 'History not found' }, { status: 404 });
    }

    const update: Record<string, unknown> = {
      description,
      event_date: eventDate,
      event_time: eventTime,
      year: yearOf(eventDate),
      updated_at: new Date().toISOString(),
    };
    // 일자가 바뀐 경우에만 노출 표기 갱신 (기존 "2019. 05~06" 같은 수기 표기 보존)
    if (current.event_date !== eventDate) {
      update.date = formatHistoryLabel(eventDate);
    }

    const { data, error } = await supabaseAdmin
      .from('history')
      .update(update)
      .eq('id', id)
      .select('id, year, date, description, event_date, event_time')
      .single();

    if (error) throw error;

    revalidatePath('/history');

    return NextResponse.json({ message: 'History updated', data });
  } catch (error) {
    console.error('Failed to update history:', error);
    return NextResponse.json({ error: 'Failed to update history' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from('history').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/history');

    return NextResponse.json({ message: 'History deleted' });
  } catch (error) {
    console.error('Failed to delete history:', error);
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}
