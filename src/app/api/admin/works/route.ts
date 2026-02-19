import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';
import { verifyToken } from '@/lib/jwt';

// GET - works 목록 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId');
    const offset = (page - 1) * limit;

    // 카테고리 필터 적용
    let query = supabaseAdmin
      .from('works')
      .select('*, work_categories(display_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', parseInt(categoryId));
    }

    const { data: works, error, count: totalCount } = await query;

    if (error) throw error;

    // 카테고리 목록 조회
    const { data: categoriesData } = await supabaseAdmin
      .from('work_categories')
      .select('*')
      .order('display_name');

    const transformedWorks = (works || []).map((work: any) => {
      const contentImages = Array.isArray(work.content_images)
        ? work.content_images
        : [];

      return {
        id: work.id,
        title: work.title,
        categoryId: work.category_id,
        categoryName: work.work_categories?.display_name || "",
        description: work.description,
        eventDate: work.event_date,
        thumbnailImage: work.thumbnail_image,
        contentImages,
        viewCount: work.view_count,
        createdAt: work.created_at,
        updatedAt: work.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      works: transformedWorks,
      totalCount: totalCount || 0,
      categories: (categoriesData || []).map(c => ({
        id: c.id,
        displayName: c.display_name,
        isActive: c.is_active,
      })),
      hasMore: offset + limit < (totalCount || 0),
    });
  } catch (error) {
    console.error("Error reading works data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load works data" },
      { status: 500 }
    );
  }
}

// POST - 새 work 추가
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description = '', // 선택사항
      categoryId,
      eventDate,
      thumbnailImage,
      contentImages = [],
    } = body;

    // 필수 필드 검증
    if (!title || !categoryId || !eventDate || !thumbnailImage) {
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