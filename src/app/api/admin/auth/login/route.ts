import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import { generateToken } from '@/lib/jwt';
import { AdminLoginRequest } from '@/types/admin';

export async function POST(request: NextRequest) {
  try {
    const body: AdminLoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // -----------------------------
    // 1) 관리자 조회
    // -----------------------------
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (adminError || !admins) {
      // 실패 로그 기록
      await supabase.from('admin_login_logs').insert({
        admin_id: 0,
        ip_address: ip,
        user_agent: userAgent,
        status: 'failed',
      });
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    const admin = admins; // single() 사용했으므로 바로 객체

    // -----------------------------
    // 2) 비밀번호 검증
    // -----------------------------
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      await supabase.from('admin_login_logs').insert({
        admin_id: admin.id,
        ip_address: ip,
        user_agent: userAgent,
        status: 'failed',
      });
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // -----------------------------
    // 3) 로그인 정보 업데이트
    // -----------------------------
    await supabase.from('admins').update({
      ip_address: ip,
      last_login: new Date().toISOString(),
      login_count: (admin.login_count || 0) + 1,
    }).eq('id', admin.id);

    await supabase.from('admin_login_logs').insert({
      admin_id: admin.id,
      ip_address: ip,
      user_agent: userAgent,
      status: 'success',
    });

    // -----------------------------
    // 4) JWT 토큰 생성
    // -----------------------------
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
      },
      token,
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
