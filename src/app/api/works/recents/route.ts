import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!  // 읽기 + 필터링 가능
    );

    // 숨김 카테고리 ID 목록 조회 (메인 페이지에서 제외)
    const { data: hiddenCats } = await supabase
      .from("work_categories")
      .select("id")
      .eq("is_hidden_from_public", true);
    const hiddenIds = hiddenCats?.map((c: { id: number }) => c.id) ?? [];

    // 최신 작업 가져오기
    let worksQuery = supabase
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
        work_categories (
          display_name
        )
      `)
      .eq("is_active", 1);

    if (hiddenIds.length > 0) {
      worksQuery = worksQuery.not("category_id", "in", `(${hiddenIds.join(",")})`);
    }

    const { data, error } = await worksQuery
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { error: "Failed to load recent works data" },
        { status: 500 }
      );
    }

    // 데이터 변환
    const transformedWorks = (data || []).map((work: any) => {
      let contentImages: string[] = [];

      if (typeof work.content_images === 'string') {
        try {
          contentImages = JSON.parse(work.content_images);
        } catch (e) {
          contentImages = [];
        }
      } else if (Array.isArray(work.content_images)) {
        contentImages = work.content_images;
      }

      // work_categories는 배열 또는 단일 객체일 수 있음
      const categories = work.work_categories;
      const categoryDisplayName = Array.isArray(categories)
        ? categories[0]?.display_name ?? ''
        : categories?.display_name ?? '';

      return {
        id: work.id,
        title: work.title,
        categoryId: work.category_id,
        categoryDisplayName,  // 여기가 핵심!
        description: work.description,
        eventDate: work.event_date,
        eventYear: new Date(work.event_date).getFullYear().toString(),
        thumbnailImage: work.thumbnail_image,
        contentImages,
        viewCount: work.view_count,
      };
    });

    return NextResponse.json({
      works: transformedWorks,
      totalCount: transformedWorks.length,
    });
  } catch (error) {
    console.error("Error reading recent works data:", error);
    return NextResponse.json(
      { error: "Failed to load recent works data" },
      { status: 500 }
    );
  }
}
