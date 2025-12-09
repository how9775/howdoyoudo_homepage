import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export interface ContactConfig {
  address: string;
  emails: string[];
  phone: string;
  fax: string;
}

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

export async function getContactInfo(): Promise<ContactConfig> {
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
      console.log('Contact 정보 로드됨:', config);
      return config;
    } catch (error: any) {
      // 파일이 없으면 기본값 반환
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        return {
          address: '',
          emails: [],
          phone: '',
          fax: '',
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Contact 정보 로드 오류:', error);
    // 에러 발생 시 기본값 반환
    return {
      address: '',
      emails: [],
      phone: '',
      fax: '',
    };
  }
}