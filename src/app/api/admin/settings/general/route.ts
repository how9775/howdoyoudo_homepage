import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/jwt';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'settings.config.json');

interface SettingsConfig {
  introductionFileShown: boolean;
}

// GET: 설정 정보 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 파일 존재 여부 확인
    try {
      await fs.access(CONFIG_PATH);
    } catch {
      // 파일이 없으면 기본값 생성
      const defaultConfig: SettingsConfig = {
        introductionFileShown: true, // 기본값: 보이기
      };
      await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
      await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      return NextResponse.json({
        success: true,
        data: defaultConfig,
      });
    }

    const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config: SettingsConfig = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('설정 정보 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '설정 정보를 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

// POST: 설정 정보 업데이트
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { introductionFileShown } = body;

    // 유효성 검증
    if (typeof introductionFileShown !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'introductionFileShown은 boolean 값이어야 합니다.',
        },
        { status: 400 }
      );
    }

    const config: SettingsConfig = {
      introductionFileShown,
    };

    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('설정 정보 저장 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '설정 정보를 저장할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}