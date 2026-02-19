import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 클라이언트 초기화
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // https://<account-id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `파일 크기는 5MB를 초과할 수 없습니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)` 
        },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)' },
        { status: 400 }
      );
    }

    // 파일 이름 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${ext}`;

    // R2 경로 설정
    const r2Path = `howdoyoudo/works/${filename}`;

    // 파일을 Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // R2에 업로드
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: r2Path,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(uploadCommand);

    
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || '';
    const fileUrl = `${publicDomain}/${r2Path}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        path: r2Path,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { success: false, error: '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}