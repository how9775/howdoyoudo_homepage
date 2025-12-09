import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

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

// GET: 설정 정보 조회 (퍼블릭)
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

      const config: SettingsConfig = JSON.parse(body);
      return NextResponse.json({
        success: true,
        data: config,
      });
    } catch (error: any) {
      // 파일이 없으면 기본값 반환
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        const defaultConfig: SettingsConfig = {
          introductionFileShown: false,
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
        data: { introductionFileShown: true },
      },
      { status: 500 }
    );
  }
}