import { ListObjectsV2Command, S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.R2_BUCKET_NAME || '';
const publicDomain = process.env.R2_PUBLIC_DOMAIN || '';
const prefix = 'howdoyoudo/files/introduction/';

// GET - 현재 업로드된 파일 정보 가져오기
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const list = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      })
    );

    if (!list.Contents || list.Contents.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const pdfFile = list.Contents.find(item => item.Key?.endsWith('.pdf'));
    
    if (!pdfFile || !pdfFile.Key) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // 파일명 추출 (경로 제거)
    const fileName = pdfFile.Key.split('/').pop() || '';
    
    // 파일 크기를 MB로 변환
    const fileSizeInMB = pdfFile.Size ? (pdfFile.Size / (1024 * 1024)).toFixed(2) : '0';
    
    // 최종 수정일
    const updatedAt = pdfFile.LastModified 
      ? new Date(pdfFile.LastModified).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).replace(/\. /g, '.').replace(/\.$/, '')
      : '';

    // URL 생성
    const encodedKey = pdfFile.Key.split('/').map(encodeURIComponent).join('/');
    const fileUrl = `${publicDomain}/${encodedKey}`;

    return NextResponse.json({
      success: true,
      data: {
        name: fileName,
        size: `${fileSizeInMB} MB`,
        updatedAt,
        url: fileUrl,
        key: pdfFile.Key,
      },
    });
  } catch (error) {
    console.error('파일 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '파일 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 새 파일 업로드 (기존 파일 삭제)
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

    // PDF 파일만 허용
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 1. 기존 파일들 삭제
    const list = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      })
    );

    if (list.Contents && list.Contents.length > 0) {
      for (const item of list.Contents) {
        if (item.Key) {
          await r2Client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: item.Key,
            })
          );
        }
      }
    }

    // 2. 새 파일 업로드
    const r2Path = `${prefix}${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: r2Path,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // 3. 업로드된 파일 정보 반환
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const updatedAt = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');

    const encodedKey = r2Path.split('/').map(encodeURIComponent).join('/');
    const fileUrl = `${publicDomain}/${encodedKey}`;

    return NextResponse.json({
      success: true,
      data: {
        name: file.name,
        size: `${fileSizeInMB} MB`,
        updatedAt,
        url: fileUrl,
        key: r2Path,
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