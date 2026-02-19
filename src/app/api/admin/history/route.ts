import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';

// GET - 모든 history 조회 (관리자용) - order 기준으로 정렬
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('history')
      .select('*')
      .order('order', { ascending: true }); // order 기준으로 정렬

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
    const body = await request.json();
    const { year, date, description } = body;

    if (!year || !date || !description) {
      return NextResponse.json(
        { error: 'Year, date, and description are required' },
        { status: 400 }
      );
    }

    // 현재 최대 order 값 조회
    const { data: maxOrderData } = await supabaseAdmin
      .from('history')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = maxOrderData ? maxOrderData.order + 1 : 1;

    // id를 명시적으로 제외하고 insert
    const { data, error } = await supabaseAdmin
      .from('history')
      .insert({ 
        year, 
        date, 
        description,
        order: nextOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    return NextResponse.json(
      { message: 'History created', data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create history' },
      { status: 500 }
    );
  }
}

// DELETE - 일괄 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs array is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('history')
      .delete()
      .in('id', ids);

    if (error) throw error;

    return NextResponse.json(
      { message: `${ids.length}개 항목이 삭제되었습니다.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete histories:', error);
    return NextResponse.json(
      { error: 'Failed to delete histories' },
      { status: 500 }
    );
  }
}

// PATCH - order 업데이트 (드래그앤드롭용)
export async function PATCH(request: NextRequest) {
  try {
    const { updates } = await request.json();

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // 각 항목의 order 업데이트
    const updatePromises = updates.map(({ id, order }: { id: number; order: number }) =>
      supabaseAdmin
        .from('history')
        .update({ order })
        .eq('id', id)
    );

    await Promise.all(updatePromises);

    return NextResponse.json(
      { message: 'Order updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}