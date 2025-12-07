import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'contact.config.json');
interface ContactConfig {
  address: string;
  emails: string[];
  phone: string;
  fax: string;
}

// GET: Contact 정보 조회
export async function GET() {
  try {
    // 파일 존재 여부 확인
    try {
      await fs.access(CONFIG_PATH);
    } catch {
      // 파일이 없으면 기본값 생성
      const defaultConfig: ContactConfig = {
        address: '',
        emails: [],
        phone: '',
        fax: '',
      };
      await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      return NextResponse.json({
        success: true,
        data: defaultConfig,
      });
    }

    const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config: ContactConfig = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Contact 정보 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Contact 정보를 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

// POST: Contact 정보 업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, emails, phone, fax } = body;

    // 유효성 검증
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '주소를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '최소 하나의 이메일을 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          {
            success: false,
            error: `유효하지 않은 이메일 형식입니다: ${email}`,
          },
          { status: 400 }
        );
      }
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '대표 번호를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    const config: ContactConfig = {
      address: address.trim(),
      emails: emails.map((email: string) => email.trim()),
      phone: phone.trim(),
      fax: fax ? fax.trim() : '',
    };

    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Contact 정보 저장 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Contact 정보를 저장할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}