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
      .eq('is_active', true) // boolean으로 변경
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
    const { error: updateError } = await supabase
      .from('works')
      .update({ view_count: work.view_count + 1 })
      .eq('id', workId);

    if (updateError) {
      console.error('View count update error:', updateError);
    }

    // prev / next 조회
    const { data: prevWork } = await supabase
      .from('works')
      .select('id, title')
      .lt('id', workId)
      .eq('is_active', true) // boolean으로 변경
      .order('id', { ascending: false })
      .limit(1);

    const { data: nextWork } = await supabase
      .from('works')
      .select('id, title')
      .gt('id', workId)
      .eq('is_active', true) // boolean으로 변경
      .order('id', { ascending: true })
      .limit(1);

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

    // 최종 반환 형식 맞추기
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
        prev: prevWork?.[0] || null,
        next: nextWork?.[0] || null,
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