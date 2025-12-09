// src/lib/emailService.ts
import nodemailer from 'nodemailer';

export interface ContactFormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

// SMTP 설정 (환경변수에서 가져오기)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// 이메일 HTML 템플릿 (테이블 기반 - 메일플러그 등 모든 클라이언트 호환)
function generateEmailHTML(data: ContactFormData): string {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- 메인 컨테이너 -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- 헤더 -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">새로운 문의</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">웹사이트에서 문의가 접수되었습니다</p>
            </td>
          </tr>

          <!-- 카테고리 -->
          <tr>
            <td style="padding: 30px 30px 0 30px;">
              <table border="0" cellpadding="12" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td width="120" style="background-color: #f9fafb; font-weight: bold; color: #374151; font-size: 13px; border-bottom: 1px solid #e5e7eb;">카테고리</td>
                  <td style="background-color: #ffffff; color: #111827; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                    <span style="display: inline-block;font-size: 13px;">${data.category}</span>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; font-weight: bold; color: #374151; font-size: 13px; border-bottom: 1px solid #e5e7eb;">제목</td>
                  <td style="background-color: #ffffff; color: #111827; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                    <strong>${data.subject}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; font-weight: bold; color: #374151; font-size: 13px; border-bottom: 1px solid #e5e7eb;">보낸 사람</td>
                  <td style="background-color: #ffffff; color: #111827; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; font-weight: bold; color: #374151; font-size: 13px; border-bottom: 1px solid #e5e7eb;">이메일</td>
                  <td style="background-color: #ffffff; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                    <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none; font-weight: bold;">${data.email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 문의 내용 -->
          <tr>
            <td style="padding: 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 15px; font-weight: bold;">문의 내용</h3>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px;">
                    <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 25px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">hdyd.co.kr 웹사이트 문의 폼을 통해 자동 발송된 메일입니다.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 이메일 발송 함수
export async function sendContactEmail(
  data: ContactFormData,
  recipientEmails: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // SMTP 설정 확인
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('SMTP credentials not configured');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    // 연결 테스트
    await transporter.verify();

    // 이메일 발송
    const info = await transporter.sendMail({
      from: `"웹사이트 문의" <${process.env.SMTP_USER}>`,
      to: recipientEmails.join(', '),
      replyTo: data.email,
      subject: `[${data.category}] ${data.subject}`,
      html: generateEmailHTML(data),
      text: `
카테고리: ${data.category}
제목: ${data.subject}
보낸 사람: ${data.name}
이메일: ${data.email}

문의 내용:
${data.message}
      `,
    });

    console.log('Email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}