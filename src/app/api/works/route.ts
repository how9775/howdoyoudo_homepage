import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { WorkItemDB, WorkItem, WorksResponse, CategoryInfo } from '@/types/works';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "21");
    const categoryId = searchParams.get("categoryId");
    const year = searchParams.get("year"); // 'recent' | 'previous'

    const offset = (page - 1) * limit;
    const currentYear = new Date().getFullYear();

    // WHERE 조건 구성
    const whereConditions = ['w.is_active = 1'];
    const queryParams: any[] = [];

    if (categoryId && categoryId !== 'all') {
      whereConditions.push('w.category_id = ?');
      queryParams.push(parseInt(categoryId));
    }

    if (year === 'recent') {
      whereConditions.push('YEAR(w.event_date) = ?');
      queryParams.push(currentYear);
    } else if (year === 'previous') {
      whereConditions.push('YEAR(w.event_date) < ?');
      queryParams.push(currentYear);
    }

    const whereClause = whereConditions.join(' AND ');

    // 전체 개수 조회
    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM works w
       WHERE ${whereClause}`,
      queryParams
    );
    const totalCount = countResult[0]?.count || 0;

    // 데이터 조회
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
        w.view_count,
        w.created_at,
        w.updated_at
       FROM works w
       JOIN work_categories c ON w.category_id = c.id
       WHERE ${whereClause}
       ORDER BY w.event_date DESC, w.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // 카테고리 목록 조회
    const categories = await query<{
      id: number;
      display_name: string;
      is_active: boolean;
      created_at: string;
    }>(
      `SELECT id, display_name, is_active, created_at
       FROM work_categories
       WHERE is_active = 1
       ORDER BY id ASC`
    );

    // 데이터 변환
    const transformedWorks: WorkItem[] = works.map(work => {
      let contentImages: string[] = [];
      if (typeof work.content_images === 'string') {
        try {
          contentImages = JSON.parse(work.content_images);
        } catch (e) {
          contentImages = [];
        }
      } else {
        contentImages = work.content_images || [];
      }

      return {
        id: work.id,
        title: work.title,
        categoryId: work.category_id,
        categoryDisplayName: work.category_display_name,
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
      totalCount,
      categories: categories.map(c => ({
        id: c.id,
        displayName: c.display_name,
        isActive: c.is_active,
        createdAt: c.created_at,
      })),
      hasMore: offset + limit < totalCount,
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