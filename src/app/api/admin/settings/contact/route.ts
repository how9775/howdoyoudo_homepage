import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 클라이언트 초기화
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.R2_BUCKET_NAME || '';
const configKey = 'howdoyoudo/files/config/contact.config.json';

interface ContactConfig {
  address: string;
  emails: string[];
  phone: string;
  fax: string;
}

// GET: Contact 정보 조회
export async function GET() {
  try {
    // R2에서 config 파일 가져오기
    try {
      const response = await r2Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: configKey,
        })
      );

      const body = await response.Body?.transformToString();
      if (!body) {
        throw new Error('Empty response');
      }

      const config: ContactConfig = JSON.parse(body);
      return NextResponse.json({
        success: true,
        data: config,
      });
    } catch (error: any) {
      // 파일이 없으면 기본값 반환
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        const defaultConfig: ContactConfig = {
          address: '',
          emails: [],
          phone: '',
          fax: '',
        };
        return NextResponse.json({
          success: true,
          data: defaultConfig,
        });
      }
      throw error;
    }
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

    // R2에 저장
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: configKey,
        Body: JSON.stringify(config, null, 2),
        ContentType: 'application/json',
      })
    );

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