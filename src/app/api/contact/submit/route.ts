// src/app/api/contact/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { checkSubmissionLimit } from '@/lib/rateLimiter';
import { validateContactForm, sanitizeInput, getClientIP } from '@/lib/validation';
import { sendContactEmail, ContactFormData } from '@/lib/emailService';

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

// Contact 정보 가져오기
async function getContactEmails(): Promise<string[]> {
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
    return config.emails || [];
  } catch (error) {
    console.error('Failed to load contact emails:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP 주소 추출
    const clientIP = getClientIP(request);
    
    // 2. Rate Limiting 체크
    const rateLimitResult = await checkSubmissionLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `너무 많은 요청이 발생했습니다. ${rateLimitResult.retryAfter}초 후에 다시 시도해주세요.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. 요청 본문 파싱
    const body = await request.json();

    // 4. 입력 검증
    const validation = validateContactForm(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors[0],
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // 5. 입력값 Sanitization
    const sanitizedData: ContactFormData = {
      name: sanitizeInput(body.name),
      email: sanitizeInput(body.email),
      category: sanitizeInput(body.category),
      subject: sanitizeInput(body.subject),
      message: sanitizeInput(body.message),
    };

    // 6. 수신자 이메일 주소 가져오기
    const recipientEmails = await getContactEmails();
    if (recipientEmails.length === 0) {
      console.error('No recipient emails configured');
      return NextResponse.json(
        {
          success: false,
          error: '이메일 전송 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.',
        },
        { status: 500 }
      );
    }

    // 7. 이메일 발송
    const emailResult = await sendContactEmail(sanitizedData, recipientEmails);
    
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 500 }
      );
    }

    // 8. 성공 응답
    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.',
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '요청 처리 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 처리 (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}