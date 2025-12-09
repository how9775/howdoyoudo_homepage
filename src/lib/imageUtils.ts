// lib/imageUtils.ts

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * 이미지를 리사이즈하고 압축합니다
 * @param file 원본 이미지 파일
 * @param options 리사이즈 옵션
 * @returns 리사이즈된 이미지 Blob 또는 null (리사이즈 불필요 시)
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<Blob | null> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    outputType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;

      // 이미지가 기준보다 작거나 같으면 리사이즈 불필요
      if (width <= maxWidth && height <= maxHeight) {
        URL.revokeObjectURL(img.src);
        resolve(null); // 리사이즈 불필요
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(img.src);
        reject(new Error('Canvas context를 생성할 수 없습니다.'));
        return;
      }

      // 비율 유지하면서 리사이즈
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      const newWidth = Math.floor(width * ratio);
      const newHeight = Math.floor(height * ratio);

      canvas.width = newWidth;
      canvas.height = newHeight;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(img.src);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 변환에 실패했습니다.'));
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 이미지 파일인지 확인
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 허용된 이미지 타입인지 확인
 */
export function isAllowedImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
}