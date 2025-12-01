import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';
import { WorkItemDB } from '@/types/works';

// GET - 관리자용 works 조회 (페이징 + 필터)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const categoryId = searchParams.get("categoryId");

    const offset = (page - 1) * limit;

    // 쿼리 빌더
    let worksQuery = supabaseAdmin
      .from("works")
      .select(`
        id,
        title,
        category_id,
        description,
        event_date,
        thumbnail_image,
        content_images,
        view_count,
        created_at,
        updated_at,
        work_categories (
          display_name
        )
      `, { count: 'exact' });

    // 카테고리 필터
    if (categoryId && categoryId !== "all") {
      worksQuery = worksQuery.eq("category_id", parseInt(categoryId));
    }

    // 정렬 및 페이지네이션
    worksQuery = worksQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: worksData, error: worksError, count: totalCount } = await worksQuery;

    if (worksError) {
      console.error("Supabase works query error:", worksError);
      return NextResponse.json(
        { success: false, error: "Failed to load works data" },
        { status: 500 }
      );
    }

    // Categories 조회
    const { data: categoriesData } = await supabaseAdmin
      .from("work_categories")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    // 데이터 변환
    const transformedWorks = (worksData || []).map((work: any) => {
      let contentImages: string[] = [];
      if (typeof work.content_images === "string") {
        try {
          contentImages = JSON.parse(work.content_images);
        } catch {
          contentImages = [];
        }
      } else if (Array.isArray(work.content_images)) {
        contentImages = work.content_images;
      }

      return {
        id: work.id,
        title: work.title,
        categoryId: work.category_id,
        categoryDisplayName: work.work_categories?.display_name ?? "",
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
