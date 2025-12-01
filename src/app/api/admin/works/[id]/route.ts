import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { verifyToken } from '@/lib/jwt';

// GET - 특정 작업 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const workId = parseInt(id);

    if (isNaN(workId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    const works = await query(
      `SELECT 
        w.*,
        c.display_name as category_display_name
       FROM works w
       JOIN work_categories c ON w.category_id = c.id
       WHERE w.id = ?`,
      [workId]
    );

    if (works.length === 0) {
      return NextResponse.json(
        { success: false, error: '작업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      work: works[0],
    });
  } catch (error) {
    console.error('Error reading work:', error);
    return NextResponse.json(
      { success: false, error: '작업 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT - 작업 수정 (활성/비활성 토글 포함)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const workId = parseInt(id);

    if (isNaN(workId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      eventDate,
      thumbnailImage,
      contentImages,
      isActive,
    } = body;

    // 업데이트할 필드 구성
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (categoryId !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(categoryId);
    }
    if (eventDate !== undefined) {
      updateFields.push('event_date = ?');
      updateValues.push(eventDate);
    }
    if (thumbnailImage !== undefined) {
      updateFields.push('thumbnail_image = ?');
      updateValues.push(thumbnailImage);
    }
    if (contentImages !== undefined) {
      updateFields.push('content_images = ?');
      updateValues.push(JSON.stringify(contentImages));
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(isActive ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: '업데이트할 필드가 없습니다.' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(workId);

    await query(
      `UPDATE works SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // 업데이트된 작업 조회
    const updatedWork = await query(
      `SELECT 
        w.*,
        c.display_name as category_display_name
       FROM works w
       JOIN work_categories c ON w.category_id = c.id
       WHERE w.id = ?`,
      [workId]
    );

    if (updatedWork.length === 0) {
      return NextResponse.json(
        { success: false, error: '작업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '작업이 성공적으로 수정되었습니다.',
      work: updatedWork[0],
    });
  } catch (error) {
    console.error('Error updating work:', error);
    return NextResponse.json(
      { success: false, error: '작업 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - 작업 완전 삭제 (DB에서 영구 제거)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const workId = parseInt(id);

    if (isNaN(workId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    // DB에서 완전히 삭제 (하드 삭제)
    await query(
      'DELETE FROM works WHERE id = ?',
      [workId]
    );

    return NextResponse.json({
      success: true,
      message: '작업이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Error deleting work:', error);
    return NextResponse.json(
      { success: false, error: '작업 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}