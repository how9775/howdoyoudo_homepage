import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'settings.config.json');

interface SettingsConfig {
  introductionFileShown: boolean;
}

// GET: 설정 정보 조회
export async function GET() {
  try {
    // 파일 존재 여부 확인
    try {
      await fs.access(CONFIG_PATH);
    } catch {
      const defaultConfig: SettingsConfig = {
        introductionFileShown: false,
      };
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
        data: { introductionFileShown: true }, 
      },
      { status: 500 }
    );
  }
}