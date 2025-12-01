import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';
import { verifyToken } from '@/lib/jwt';

// GET - 특정 작업 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const workId = parseInt(id);
    if (isNaN(workId)) return NextResponse.json({ success: false, error: 'Invalid work ID' }, { status: 400 });

    const { data: work, error } = await supabaseAdmin
      .from('works')
      .select('*, work_categories(display_name)')
      .eq('id', workId)
      .single();

    if (error) throw error;
    if (!work) return NextResponse.json({ success: false, error: '작업을 찾을 수 없습니다.' }, { status: 404 });

    return NextResponse.json({ success: true, work });
  } catch (error) {
    console.error('Error reading work:', error);
    return NextResponse.json({ success: false, error: '작업 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PUT - 작업 수정 (활성/비활성 포함)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });

    const { id } = await params;
    const workId = parseInt(id);
    if (isNaN(workId)) return NextResponse.json({ success: false, error: 'Invalid work ID' }, { status: 400 });

    const body = await request.json();
    const updateData: any = {};
    const fields = ['title','description','categoryId','eventDate','thumbnailImage','contentImages','isActive'];

    fields.forEach((f) => {
      if (body[f] !== undefined) {
        switch(f){
          case 'categoryId': updateData['category_id'] = body[f]; break;
          case 'eventDate': updateData['event_date'] = body[f]; break;
          case 'thumbnailImage': updateData['thumbnail_image'] = body[f]; break;
          case 'contentImages': updateData['content_images'] = body[f]; break;
          case 'isActive': updateData['is_active'] = body[f]; break;
          default: updateData[f] = body[f]; break;
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '업데이트할 필드가 없습니다.' }, { status: 400 });
    }

    const { data: updatedWork, error } = await supabaseAdmin
      .from('works')
      .update(updateData)
      .eq('id', workId)
      .select('*, work_categories(display_name)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: '작업이 성공적으로 수정되었습니다.', work: updatedWork });

  } catch (error) {
    console.error('Error updating work:', error);
    return NextResponse.json({ success: false, error: '작업 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE - 작업 완전 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });

    const { id } = await params;
    const workId = parseInt(id);
    if (isNaN(workId)) return NextResponse.json({ success: false, error: 'Invalid work ID' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('works')
      .delete()
      .eq('id', workId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '작업이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting work:', error);
    return NextResponse.json({ success: false, error: '작업 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
