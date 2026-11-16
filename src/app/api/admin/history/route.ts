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

const HISTORY_COLUMNS = 'id, year, date, description, event_date, event_time';

function isAuthorized(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && !!verifyToken(token);
}

const unauthorized = () =>
  NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

// GET - 모든 history 조회 (관리자용) - 일자/시간 내림차순
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    const { data, error } = await supabaseAdmin
      .from('history')
      .select(HISTORY_COLUMNS)
      .order('event_date', { ascending: false })
      .order('event_time', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch histories:', error);
    return NextResponse.json({ error: 'Failed to fetch histories' }, { status: 500 });
  }
}

// POST - 새 history 추가 (event_date 필수, event_time 선택)
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  try {
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

    // 수동 순서(order) 컬럼은 deprecated: 동일 일자/시간은 id(등록순)로 정렬
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('history')
      .insert({
        year: yearOf(eventDate),
        date: formatHistoryLabel(eventDate),
        description,
        event_date: eventDate,
        event_time: eventTime,
        created_at: now,
        updated_at: now,
      })
      .select(HISTORY_COLUMNS)
      .single();

    if (error) throw error;

    revalidatePath('/history');

    return NextResponse.json({ message: 'History created', data }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create history:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create history' },
      { status: 500 }
    );
  }
}

// DELETE - 일괄 삭제
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('history').delete().in('id', ids);

    if (error) throw error;

    revalidatePath('/history');

    return NextResponse.json(
      { message: `${ids.length}개 항목이 삭제되었습니다.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete histories:', error);
    return NextResponse.json({ error: 'Failed to delete histories' }, { status: 500 });
  }
}
