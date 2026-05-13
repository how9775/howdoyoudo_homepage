import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/utils/supabase';
import { verifyToken } from '@/lib/jwt';

// GET - 카테고리 목록 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data: categories, error } = await supabaseAdmin
      .from('work_categories')
      .select('id, display_name, is_active, created_at')
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '카테고리 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// POST - 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { displayName } = await request.json();
    if (!displayName || !displayName.trim()) {
      return NextResponse.json(
        { success: false, error: '카테고리 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('work_categories')
      .insert({ display_name: displayName.trim(), is_active: true })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/works');
    return NextResponse.json({
      success: true,
      message: '카테고리가 성공적으로 생성되었습니다.',
      data,
    });
  } catch (error) {
    console.error('카테고리 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '카테고리 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH - 카테고리 이름 수정
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id, displayName } = await request.json();
    if (!id || !displayName || !displayName.trim()) {
      return NextResponse.json(
        { success: false, error: '카테고리 ID와 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('work_categories')
      .update({ display_name: displayName.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/works');
    return NextResponse.json({
      success: true,
      message: '카테고리 이름이 수정되었습니다.',
      data,
    });
  } catch (error) {
    console.error('카테고리 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '카테고리 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - 카테고리 삭제
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');
    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: '카테고리 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 카테고리를 사용하는 게시글이 있는지 확인
    const { data: works, error: worksError } = await supabaseAdmin
      .from('works')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', parseInt(categoryId));

    if (worksError) throw worksError;

    if ((works as any)?.count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '이 카테고리를 사용하는 게시글이 있어 삭제할 수 없습니다.',
        },
        { status: 400 }
      );
    }

    // 삭제
    const { error } = await supabaseAdmin
      .from('work_categories')
      .delete()
      .eq('id', parseInt(categoryId));

    if (error) throw error;

    revalidatePath('/works');
    return NextResponse.json({
      success: true,
      message: '카테고리가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('카테고리 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '카테고리 삭제에 실패했습니다. 카테고리를 사용하는 게시글을 삭제하고 시도해주세요.' },
      { status: 500 }
    );
  }
}
