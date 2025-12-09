import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { verifyToken } from '@/lib/jwt';

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
const configKey = 'howdoyoudo/files/config/settings.config.json';

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

      const config: SettingsConfig = JSON.parse(body);
      return NextResponse.json({
        success: true,
        data: config,
      });
    } catch (error: any) {
      // 파일이 없으면 기본값 반환
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        const defaultConfig: SettingsConfig = {
          introductionFileShown: true, // 기본값: 보이기
        };
        return NextResponse.json({
          success: true,
          data: defaultConfig,
        });
      }
      throw error;
    }
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