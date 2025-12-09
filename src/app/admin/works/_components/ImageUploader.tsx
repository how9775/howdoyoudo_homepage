'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { resizeImage, formatFileSize, isAllowedImageType } from '@/lib/imageUtils';

interface ImageFile {
  file: File;
  preview: string;
}

interface ImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  startIndex?: number;
  showThumbnailBadge?: boolean;
}

interface ProcessingState {
  total: number;
  current: number;
  currentFile: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RESIZE_MAX_WIDTH = 1920;
const RESIZE_MAX_HEIGHT = 1920;

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 20,
  startIndex = 0,
  showThumbnailBadge = false,
}: ImageUploaderProps) {
  const [processing, setProcessing] = useState<ProcessingState | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    // 파일 타입 검증
    const validFiles = filesToAdd.filter((file) => {
      if (!isAllowedImageType(file)) {
        alert(`${file.name}은(는) 지원하지 않는 형식입니다. (JPG, PNG, WEBP만 가능)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setProcessing({
      total: validFiles.length,
      current: 0,
      currentFile: '',
    });

    const newImages: ImageFile[] = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        setProcessing({
          total: validFiles.length,
          current: i + 1,
          currentFile: file.name,
        });

        // 파일 크기 확인
        if (file.size > MAX_FILE_SIZE) {
          // 5MB 초과 시 리사이즈 시도
          try {
            const resizedBlob = await resizeImage(file, {
              maxWidth: RESIZE_MAX_WIDTH,
              maxHeight: RESIZE_MAX_HEIGHT,
              quality: 0.85,
              outputType: file.type as any,
            });

            // resizedBlob이 null이면 원본이 기준보다 작다는 의미
            // 하지만 용량은 5MB 초과이므로 품질을 낮춰서 재시도
            if (!resizedBlob) {
              const resizedBlob2 = await resizeImage(file, {
                maxWidth: RESIZE_MAX_WIDTH,
                maxHeight: RESIZE_MAX_HEIGHT,
                quality: 0.7,
                outputType: 'image/jpeg',
              });

              // 여전히 null이면 원본 사용 (기준보다 작음)
              if (!resizedBlob2) {
                alert(
                  `${file.name}은(는) 5MB를 초과합니다. (${formatFileSize(file.size)})\n더 작은 이미지를 선택해주세요.`
                );
                continue;
              }

              if (resizedBlob2.size > MAX_FILE_SIZE) {
                alert(
                  `${file.name}은(는) 최적화 후에도 5MB를 초과합니다. (${formatFileSize(resizedBlob2.size)})\n더 작은 이미지를 선택해주세요.`
                );
                continue;
              }

              const resizedFile = new File([resizedBlob2], file.name, {
                type: 'image/jpeg',
              });

              newImages.push({
                file: resizedFile,
                preview: URL.createObjectURL(resizedFile),
              });
              continue;
            }

            // 리사이즈 후에도 5MB 초과하면 품질 낮춰서 재시도
            if (resizedBlob.size > MAX_FILE_SIZE) {
              const resizedBlob2 = await resizeImage(file, {
                maxWidth: RESIZE_MAX_WIDTH,
                maxHeight: RESIZE_MAX_HEIGHT,
                quality: 0.7,
                outputType: 'image/jpeg',
              });

              if (!resizedBlob2 || resizedBlob2.size > MAX_FILE_SIZE) {
                alert(
                  `${file.name}은(는) 최적화 후에도 5MB를 초과합니다. (${formatFileSize(resizedBlob2?.size || file.size)})\n더 작은 이미지를 선택해주세요.`
                );
                continue;
              }

              const resizedFile = new File([resizedBlob2], file.name, {
                type: 'image/jpeg',
              });

              newImages.push({
                file: resizedFile,
                preview: URL.createObjectURL(resizedFile),
              });
            } else {
              const resizedFile = new File([resizedBlob], file.name, {
                type: file.type,
              });

              newImages.push({
                file: resizedFile,
                preview: URL.createObjectURL(resizedFile),
              });
            }
          } catch (error) {
            console.error('이미지 리사이즈 실패:', error);
            alert(`${file.name} 처리 중 오류가 발생했습니다.`);
            continue;
          }
        } else {
          // 5MB 이하면 크기만 체크해서 필요시 리사이즈
          try {
            const resizedBlob = await resizeImage(file, {
              maxWidth: RESIZE_MAX_WIDTH,
              maxHeight: RESIZE_MAX_HEIGHT,
              quality: 0.85,
              outputType: file.type as any,
            });

            // null이면 원본이 기준보다 작으므로 원본 사용
            if (!resizedBlob) {
              newImages.push({
                file,
                preview: URL.createObjectURL(file),
              });
            } else {
              const resizedFile = new File([resizedBlob], file.name, {
                type: file.type,
              });

              newImages.push({
                file: resizedFile,
                preview: URL.createObjectURL(resizedFile),
              });
            }
          } catch (error) {
            console.error('이미지 리사이즈 실패:', error);
            // 리사이즈 실패 시 원본 사용
            newImages.push({
              file,
              preview: URL.createObjectURL(file),
            });
          }
        }
      }

      onImagesChange([...images, ...newImages]);
    } finally {
      setProcessing(null);
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Processing Progress */}
      {processing && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-blue-800 text-sm font-medium">
                이미지 처리 중... ({processing.current}/{processing.total})
              </p>
              <p className="text-blue-600 text-xs truncate mt-1">
                {processing.currentFile}
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-blue-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{
                width: `${(processing.current / processing.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
        <div className="flex items-start space-x-2 text-xs text-gray-600">
          <span className="font-medium">ℹ️</span>
          <div className="space-y-1">
            <p>• 최대 용량: <span className="font-semibold text-gray-800">5MB</span> (초과 시 자동 최적화)</p>
            <p>• 최대 크기: <span className="font-semibold text-gray-800">1920x1920px</span> (초과 시 리사이즈)</p>
            <p>• 지원 형식: <span className="font-semibold text-gray-800">JPG, PNG, WEBP</span></p>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div>
        <label
          htmlFor="image-upload"
          className={`
            flex items-center justify-center space-x-2 px-4 py-3 
            border-2 border-dashed rounded-lg cursor-pointer
            transition-colors
            ${
              images.length >= maxImages || processing
                ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
            }
          `}
        >
          <Upload className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            이미지 선택 ({images.length}/{maxImages})
          </span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          disabled={images.length >= maxImages || processing !== null}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={img.preview}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <Image
                src={img.preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              {/* 순서 표시 */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {startIndex + index + 1}
              </div>

              {/* 파일 크기 표시 */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                {formatFileSize(img.file.size)}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                  {/* 앞으로 */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="앞으로"
                    >
                      <span className="text-sm">←</span>
                    </button>
                  )}

                  {/* 삭제 */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="삭제"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* 뒤로 */}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="뒤로"
                    >
                      <span className="text-sm">→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}