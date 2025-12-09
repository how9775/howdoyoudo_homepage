import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';
import { verifyToken } from '@/lib/jwt';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 클라이언트 초기화
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

// URL에서 R2 key 추출 (howdoyoudo/works/filename.jpg)
function extractR2KeyFromUrl(url: string): string | null {
  try {
    // URL에서 경로 부분만 추출
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // /howdoyoudo/works/... 형태에서 howdoyoudo/works/... 추출
    const match = pathname.match(/\/?(howdoyoudo\/works\/.+)$/);
    if (match && match[1]) {
      // URL 디코딩 (한글 파일명 등)
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    console.error('URL 파싱 오류:', error);
    return null;
  }
}

// R2에서 이미지 삭제
async function deleteFromR2(url: string): Promise<boolean> {
  try {
    const key = extractR2KeyFromUrl(url);
    if (!key) {
      console.warn('R2 key를 추출할 수 없습니다:', url);
      return false;
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || '',
        Key: key,
      })
    );

    console.log('R2에서 삭제됨:', key);
    return true;
  } catch (error) {
    console.error('R2 삭제 오류:', error);
    return false;
  }
}

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

// DELETE - 작업 완전 삭제 (R2 이미지도 함께 삭제)
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

    // 1. 삭제 전에 work 데이터 조회 (이미지 URL 획득)
    const { data: work, error: fetchError } = await supabaseAdmin
      .from('works')
      .select('thumbnail_image, content_images')
      .eq('id', workId)
      .single();

    if (fetchError) {
      console.error('작업 조회 오류:', fetchError);
      return NextResponse.json(
        { success: false, error: '작업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. R2에서 이미지 삭제
    const deletePromises: Promise<boolean>[] = [];

    // 썸네일 이미지 삭제
    if (work.thumbnail_image) {
      deletePromises.push(deleteFromR2(work.thumbnail_image));
    }

    // 콘텐츠 이미지들 삭제
    if (work.content_images && Array.isArray(work.content_images)) {
      work.content_images.forEach((imageUrl: string) => {
        deletePromises.push(deleteFromR2(imageUrl));
      });
    }

    // 모든 R2 삭제 작업 실행 (실패해도 계속 진행)
    try {
      await Promise.allSettled(deletePromises);
    } catch (r2Error) {
      console.error('R2 삭제 중 일부 오류:', r2Error);
      // R2 삭제 실패해도 DB 삭제는 진행
    }

    // 3. DB에서 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('works')
      .delete()
      .eq('id', workId);

    if (deleteError) throw deleteError;

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