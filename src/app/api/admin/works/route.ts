import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';
import { WorkItemDB } from '@/types/works';

// GET - 관리자용 works 조회 (페이징 + 필터)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");

    const offset = (page - 1) * limit;

    let queryBuilder = supabaseAdmin
      .from('works')
      .select('*, work_categories(display_name)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId && categoryId !== 'all') {
      queryBuilder = queryBuilder.eq('category_id', parseInt(categoryId));
    }

    if (isActive === 'true') {
      queryBuilder = queryBuilder.eq('is_active', true);
    } else if (isActive === 'false') {
      queryBuilder = queryBuilder.eq('is_active', false);
    }

    const { data: works, error } = await queryBuilder;
    if (error) throw error;

    // 전체 카운트 조회
    let countBuilder = supabaseAdmin.from('works').select('*', { count: 'exact' });
    if (categoryId && categoryId !== 'all') countBuilder = countBuilder.eq('category_id', parseInt(categoryId));
    if (isActive === 'true') countBuilder = countBuilder.eq('is_active', true);
    if (isActive === 'false') countBuilder = countBuilder.eq('is_active', false);

    const { count: totalCount } = await countBuilder;
    
    // 카테고리 목록 조회
    const { data: categories, error: catError } = await supabaseAdmin
      .from('work_categories')
      .select('*')
      .order('id', { ascending: true });
    if (catError) throw catError;

    return NextResponse.json({
      success: true,
      works: works || [],
      totalCount: totalCount || 0,
      categories: categories || [],
      hasMore: offset + limit < (totalCount || 0),
      currentPage: page,
    });

  } catch (error) {
    console.error("Error reading admin works data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load works data" },
      { status: 500 }
    );
  }
}

// POST - 새 work 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      eventDate,
      thumbnailImage,
      contentImages = [],
    } = body;

    if (!title || !description || !categoryId || !eventDate || !thumbnailImage) {
      return NextResponse.json(
        { success: false, error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('works')
      .insert({
        title,
        description,
        category_id: categoryId,
        event_date: eventDate,
        thumbnail_image: thumbnailImage,
        content_images: contentImages,
        is_active: true,
        view_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '작업이 성공적으로 생성되었습니다.',
      work: data
    });

  } catch (error) {
    console.error('Error creating work:', error);
    return NextResponse.json(
      { success: false, error: '작업 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
