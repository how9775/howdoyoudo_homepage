import fs from 'fs/promises';
import path from 'path';

export interface ContactConfig {
  address: string;
  emails: string[];
  phone: string;
  fax: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'contact.config.json');

export async function getContactInfo(): Promise<ContactConfig> {
  try {
    // 파일 존재 여부 확인
    try {
      await fs.access(CONFIG_PATH);
    } catch {
      // 파일이 없으면 기본값 반환
      return {
        address: '',
        emails: [],
        phone: '',
        fax: '',
      };
    }

    const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config: ContactConfig = JSON.parse(fileContent);
    return config;
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