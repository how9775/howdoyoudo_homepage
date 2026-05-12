import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workId = parseInt(id);

    if (isNaN(workId)) {
      return NextResponse.json(
        { error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    // 작업 상세 조회
    const { data: works, error: worksError } = await supabase
      .from('works')
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
      `)
      .eq('id', workId)
      .eq('is_active', true)
      .limit(1);

    if (worksError) {
      console.error('Work query error:', worksError);
      return NextResponse.json(
        { error: 'Failed to load work detail' },
        { status: 500 }
      );
    }

    if (!works || works.length === 0) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    const work: any = works[0];

    // 조회수 증가
    await supabase
      .from('works')
      .update({ view_count: work.view_count + 1 })
      .eq('id', workId);

    // "제작" 카테고리 ID 조회 — 분리 네비게이션에 사용
    const { data: specialCat } = await supabase
      .from('work_categories')
      .select('id')
      .eq('display_name', '제작')
      .single();

    const specialCatId: number | null = specialCat?.id ?? null;
    const isSpecialWork = specialCatId !== null && work.category_id === specialCatId;
    const workEventDate: string = work.event_date;

    // 이전 게시물: 현재보다 오래된 것 중 가장 최신 (list에서 아래에 위치)
    let prevQuery = supabase
      .from('works')
      .select('id, title')
      .eq('is_active', true)
      .lt('event_date', workEventDate)
      .order('event_date', { ascending: false })
      .order('id', { ascending: false })
      .limit(1);

    // 다음 게시물: 현재보다 최신인 것 중 가장 오래된 것 (list에서 위에 위치)
    let nextQuery = supabase
      .from('works')
      .select('id, title')
      .eq('is_active', true)
      .gt('event_date', workEventDate)
      .order('event_date', { ascending: true })
      .order('id', { ascending: true })
      .limit(1);

    if (isSpecialWork) {
      // 제작 카테고리끼리만 이동
      prevQuery = prevQuery.eq('category_id', work.category_id);
      nextQuery = nextQuery.eq('category_id', work.category_id);
    } else if (specialCatId !== null) {
      // 제작 카테고리 제외하고 이동
      prevQuery = prevQuery.neq('category_id', specialCatId);
      nextQuery = nextQuery.neq('category_id', specialCatId);
    }

    const [{ data: prevWork }, { data: nextWork }] = await Promise.all([
      prevQuery,
      nextQuery,
    ]);

    // content_images JSON 처리
    let contentImages: string[] = [];
    if (typeof work.content_images === 'string') {
      try {
        contentImages = JSON.parse(work.content_images);
      } catch {
        contentImages = [];
      }
    } else if (Array.isArray(work.content_images)) {
      contentImages = work.content_images;
    }

    const transformedWork = {
      id: work.id,
      title: work.title,
      categoryId: work.category_id,
      categoryDisplayName: work.work_categories?.display_name ?? '',
      description: work.description,
      eventDate: work.event_date,
      eventYear: new Date(work.event_date).getFullYear().toString(),
      thumbnailImage: work.thumbnail_image,
      contentImages,
      viewCount: work.view_count + 1,
    };

    return NextResponse.json({
      work: transformedWork,
      navigation: {
        prev: prevWork?.[0] ?? null,
        next: nextWork?.[0] ?? null,
      },
    });
  } catch (error) {
    console.error('Error reading work detail:', error);
    return NextResponse.json(
      { error: 'Failed to load work detail' },
      { status: 500 }
    );
  }
}
