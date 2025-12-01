import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { queryOne } from '@/utils/supabase';
import { Admin } from '@/types/admin';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '인증 토큰이 없습니다.' },
        { status: 401 }
      );
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // Supabase에서 관리자 정보 조회
    const admin = await queryOne<Admin>('admins', {
      select: 'id, username, name, ip_address, last_login, login_count',
      where: { id: session.id, is_active: true }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: '관리자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        ip_address: admin.ip_address,
        last_login: admin.last_login,
        login_count: admin.login_count,
      },
    });
  } catch (error) {
    console.error('세션 확인 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
