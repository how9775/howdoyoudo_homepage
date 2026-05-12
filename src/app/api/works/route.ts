import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase";
import { WorkItem, WorksResponse } from "@/types/works";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "21", 10);
    const categoryId = searchParams.get("categoryId");
    const year = searchParams.get("year");

    const offset = (page - 1) * limit;
    const currentYear = new Date().getFullYear();

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
      `, { count: 'exact' })
      .eq("is_active", true);

    const excludeCategoryId = searchParams.get("excludeCategoryId");
    const excludeCategoryName = searchParams.get("excludeCategoryName");

    // excludeCategoryName을 ID로 변환
    let resolvedExcludeId: number | null = excludeCategoryId ? parseInt(excludeCategoryId) : null;
    if (!resolvedExcludeId && excludeCategoryName) {
      const { data: excludeCat } = await supabaseAdmin
        .from("work_categories")
        .select("id")
        .eq("display_name", excludeCategoryName)
        .single();
      if (excludeCat?.id) resolvedExcludeId = excludeCat.id;
    }

    // 필터 적용
    if (categoryId && categoryId !== "all") {
      worksQuery = worksQuery.eq("category_id", parseInt(categoryId));
    } else if (resolvedExcludeId) {
      worksQuery = worksQuery.neq("category_id", resolvedExcludeId);
    }

    if (year === "recent") {
      worksQuery = worksQuery.gte("event_date", `${currentYear}-01-01`);
    } else if (year === "previous") {
      worksQuery = worksQuery.lt("event_date", `${currentYear}-01-01`);
    }

    // 정렬 및 페이지네이션
    worksQuery = worksQuery
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: worksData, error: worksError, count: totalCount } = await worksQuery;

    if (worksError) {
      console.error("Supabase works query error:", worksError);
      return NextResponse.json(
        { error: "Failed to load works data" },
        { status: 500 }
      );
    }

    // Categories 조회
    const { data: categoriesData, error: categoriesError } = await supabaseAdmin
      .from("work_categories")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (categoriesError) {
      console.error("Supabase categories query error:", categoriesError);
    }

    // 데이터 변환
    const transformedWorks: WorkItem[] = (worksData || []).map((work: any) => {
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
        eventYear: new Date(work.event_date).getFullYear().toString(),
        thumbnailImage: work.thumbnail_image,
        contentImages,
        viewCount: work.view_count,
      };
    });

    const response: WorksResponse = {
      works: transformedWorks,
      totalCount: totalCount || 0,
      categories: (categoriesData || []).map(c => ({
        id: c.id,
        displayName: c.display_name,
        isActive: c.is_active,
        createdAt: c.created_at,
      })),
      hasMore: offset + limit < (totalCount || 0),
      currentPage: page,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error reading works data:", error);
    return NextResponse.json(
      { error: "Failed to load works data" },
      { status: 500 }
    );
  }
}