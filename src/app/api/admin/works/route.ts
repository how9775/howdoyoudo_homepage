import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { WorkItemDB } from '@/types/works';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");

    const offset = (page - 1) * limit;

    // WHERE 조건 구성
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (categoryId && categoryId !== 'all') {
      whereConditions.push('w.category_id = ?');
      queryParams.push(parseInt(categoryId));
    }

    // isActive 필터 처리 수정
    if (isActive === 'true') {
      whereConditions.push('w.is_active = 1');
    } else if (isActive === 'false') {
      whereConditions.push('w.is_active = 0');
    }
    // 'all'이면 조건 추가하지 않음

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 전체 개수 조회
    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM works w
       ${whereClause}`,
      queryParams
    );
    const totalCount = countResult[0]?.count || 0;

    // 데이터 조회 (관리자용 - 필터에 따라 조회)
    const works = await query<WorkItemDB>(
      `SELECT 
        w.id,
        w.title,
        w.category_id,
        c.display_name as category_display_name,
        w.description,
        w.event_date,
        w.thumbnail_image,
        w.content_images,
        w.is_active,
        w.view_count,
        w.created_at,
        w.updated_at
       FROM works w
       JOIN work_categories c ON w.category_id = c.id
       ${whereClause}
       ORDER BY w.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // 카테고리 목록 조회
    const categories = await query<{
      id: number;
      display_name: string;
      is_active: boolean;
    }>(
      `SELECT id, display_name, is_active
       FROM work_categories
       ORDER BY id ASC`
    );

    return NextResponse.json({
      success: true,
      works,
      totalCount,
      categories,
      hasMore: offset + limit < totalCount,
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

    // 입력값 검증
    if (!title || !description || !categoryId || !eventDate || !thumbnailImage) {
      return NextResponse.json(
        { success: false, error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 작업 생성
    const result = await query(
      `INSERT INTO works 
       (title, description, category_id, event_date, thumbnail_image, content_images, is_active, view_count)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
      [
        title,
        description,
        categoryId,
        eventDate,
        thumbnailImage,
        JSON.stringify(contentImages),
      ]
    );

    return NextResponse.json({
      success: true,
      message: '작업이 성공적으로 생성되었습니다.',
      workId: (result as any).insertId,
    });
  } catch (error) {
    console.error('Error creating work:', error);
    return NextResponse.json(
      { success: false, error: '작업 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}