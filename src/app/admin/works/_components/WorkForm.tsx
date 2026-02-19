'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CategoryManager from './CategoryManager';
import ImageUploader from './ImageUploader';
import { Save, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { resizeImage, formatFileSize, isAllowedImageType } from '@/lib/imageUtils';

interface ImageFile {
  file: File;
  preview: string;
}

interface WorkFormData {
  title: string;
  categoryId: number | null;
  description: string;
  eventDate: string;
}

interface WorkFormProps {
  initialData?: WorkFormData;
  workId?: number;
  mode: 'create' | 'edit';
  existingThumbnail?: string;
  existingImages?: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RESIZE_MAX_WIDTH = 1920;
const RESIZE_MAX_HEIGHT = 1920;

export default function WorkForm({
  initialData,
  workId,
  mode,
  existingThumbnail,
  existingImages = [],
}: WorkFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<WorkFormData>({
    title: '',
    categoryId: null,
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    ...initialData,
  });

  // 썸네일 관리
  const [thumbnailFile, setThumbnailFile] = useState<ImageFile | null>(null);
  const [keepExistingThumbnail, setKeepExistingThumbnail] = useState<string | null>(
    existingThumbnail || null
  );
  const [thumbnailProcessing, setThumbnailProcessing] = useState(false);

  // 콘텐츠 이미지 관리
  const [newContentImages, setNewContentImages] = useState<ImageFile[]>([]);
  const [keepExistingImages, setKeepExistingImages] = useState<string[]>(existingImages);

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    message: string;
    current: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (thumbnailFile) {
        URL.revokeObjectURL(thumbnailFile.preview);
      }
      newContentImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [thumbnailFile, newContentImages]);

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAllowedImageType(file)) {
      alert('지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)');
      e.target.value = '';
      return;
    }

    setThumbnailProcessing(true);

    try {
      let processedFile = file;

      // 파일 크기 확인 및 리사이즈
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
            alert(
              `이미지가 5MB를 초과합니다. (${formatFileSize(file.size)})\n더 작은 이미지를 선택해주세요.`
            );
            e.target.value = '';
            return;
          }

          if (resizedBlob.size > MAX_FILE_SIZE) {
            const resizedBlob2 = await resizeImage(file, {
              maxWidth: RESIZE_MAX_WIDTH,
              maxHeight: RESIZE_MAX_HEIGHT,
              quality: 0.7,
              outputType: 'image/jpeg',
            });

            if (!resizedBlob2 || resizedBlob2.size > MAX_FILE_SIZE) {
              alert(
                `이미지가 최적화 후에도 5MB를 초과합니다. (${formatFileSize(resizedBlob2?.size || file.size)})\n더 작은 이미지를 선택해주세요.`
              );
              e.target.value = '';
              return;
            }

            processedFile = new File([resizedBlob2], file.name, {
              type: 'image/jpeg',
            });
          } else {
            processedFile = new File([resizedBlob], file.name, {
              type: file.type,
            });
          }
        } catch (error) {
          console.error('이미지 리사이즈 실패:', error);
          alert('이미지 처리 중 오류가 발생했습니다.');
          e.target.value = '';
          return;
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
          if (resizedBlob) {
            processedFile = new File([resizedBlob], file.name, {
              type: file.type,
            });
          }
          // resizedBlob이 null이면 processedFile은 이미 원본 file로 설정되어 있음
        } catch (error) {
          console.error('이미지 리사이즈 실패:', error);
          // 리사이즈 실패 시 원본 사용 (processedFile은 이미 원본)
        }
      }

      if (thumbnailFile) {
        URL.revokeObjectURL(thumbnailFile.preview);
      }

      setThumbnailFile({
        file: processedFile,
        preview: URL.createObjectURL(processedFile),
      });
      setKeepExistingThumbnail(null);
    } finally {
      setThumbnailProcessing(false);
      e.target.value = '';
    }
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailFile) {
      URL.revokeObjectURL(thumbnailFile.preview);
      setThumbnailFile(null);
    }
    setKeepExistingThumbnail(null);
  };

  const handleRemoveExistingImage = (url: string) => {
    setKeepExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const uploadImage = async (imageFile: ImageFile, index: number, total: number): Promise<string> => {
    const formData = new FormData();
    formData.append('file', imageFile.file);

    setUploadProgress({
      message: `이미지 업로드 중... (${index + 1}/${total})`,
      current: index + 1,
      total,
    });

    const response = await fetch('/api/admin/works/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`이미지 업로드 실패: ${imageFile.file.name}`);
    }

    const data = await response.json();
    if (!data.success || !data.data?.url) {
      throw new Error(`이미지 URL을 받지 못했습니다: ${imageFile.file.name}`);
    }

    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    const hasThumbnail = keepExistingThumbnail || thumbnailFile;
    if (!hasThumbnail) {
      setError('썸네일 이미지를 선택해주세요.');
      return;
    }

    if (!formData.eventDate) {
      setError('행사 일자를 선택해주세요.');
      return;
    }

    setSaving(true);
    setError('');
    setUploadProgress(null);

    try {
      let thumbnailUrl = keepExistingThumbnail || '';
      const newImageUrls: string[] = [];

      const totalUploads = (thumbnailFile ? 1 : 0) + newContentImages.length;
      let uploadIndex = 0;

      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile, uploadIndex, totalUploads);
        uploadIndex++;
      }

      if (newContentImages.length > 0) {
        for (let i = 0; i < newContentImages.length; i++) {
          const url = await uploadImage(newContentImages[i], uploadIndex, totalUploads);
          newImageUrls.push(url);
          uploadIndex++;
        }
      }

      setUploadProgress({
        message: '게시글 저장 중...',
        current: totalUploads,
        total: totalUploads,
      });

      const finalContentImages = [...keepExistingImages, ...newImageUrls];

      const url =
        mode === 'create' ? '/api/admin/works' : `/api/admin/works/${workId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thumbnailImage: thumbnailUrl,
          contentImages: finalContentImages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          mode === 'create'
            ? '게시글이 성공적으로 작성되었습니다.'
            : '게시글이 성공적으로 수정되었습니다.'
        );
        router.push('/admin/works');
        router.refresh();
      } else {
        setError(data.error || '저장에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  const totalContentImages = keepExistingImages.length + newContentImages.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {uploadProgress && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <p className="text-blue-800 text-sm font-medium">
              {uploadProgress.message}
            </p>
          </div>
          <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">제목 *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="게시글 제목을 입력하세요"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          disabled={saving}
        />
      </div>

      <CategoryManager
        selectedCategoryId={formData.categoryId}
        onCategoryChange={(categoryId) => setFormData({ ...formData, categoryId })}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">행사 일자 *</label>
        <input
          type="date"
          value={formData.eventDate}
          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="게시글 설명을 입력하세요"
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">썸네일 이미지 *</label>
        
        {/* Info Box */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-start space-x-2 text-xs text-gray-600">
            <span className="font-medium"></span>
            <div className="space-y-1">
              <p>• 최대 용량: <span className="font-semibold text-gray-800">5MB</span> (초과 시 자동 최적화)</p>
              <p>• 최대 크기: <span className="font-semibold text-gray-800">1920x1920px</span> (초과 시 리사이즈)</p>
              <p>• 지원 형식: <span className="font-semibold text-gray-800">JPG, PNG, WEBP</span></p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          {thumbnailProcessing && (
            <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <p className="text-blue-800 text-xs font-medium">이미지 처리 중...</p>
              </div>
            </div>
          )}

          {(thumbnailFile || keepExistingThumbnail) && (
            <div className="mb-4">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={thumbnailFile ? thumbnailFile.preview : keepExistingThumbnail!}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                {thumbnailFile && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {formatFileSize(thumbnailFile.file.size)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="삭제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <label
            htmlFor="thumbnail-upload"
            className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
              thumbnailProcessing || saving
                ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                : 'border-blue-300 bg-blue-50 cursor-pointer hover:bg-blue-100'
            }`}
          >
            <Upload className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {thumbnailFile || keepExistingThumbnail
                ? '썸네일 변경'
                : '썸네일 선택'}
            </span>
          </label>
          <input
            id="thumbnail-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleThumbnailSelect}
            className="hidden"
            disabled={saving || thumbnailProcessing}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          콘텐츠 이미지 ({totalContentImages}개)
        </label>

        {mode === 'edit' && keepExistingImages.length > 0 && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              기존 이미지 ({keepExistingImages.length}개)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {keepExistingImages.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                >
                  <Image
                    src={url}
                    alt={`Existing ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(url)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="삭제"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            새 이미지 추가 ({newContentImages.length}개)
          </h4>
          <ImageUploader
            images={newContentImages}
            onImagesChange={setNewContentImages}
            maxImages={20 - keepExistingImages.length}
            startIndex={keepExistingImages.length}
            showThumbnailBadge={false}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-6 border-t-2 border-gray-200">
        <button
          type="submit"
          disabled={saving || thumbnailProcessing}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{mode === 'create' ? '작성하기' : '수정하기'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm('작성을 취소하시겠습니까?')) {
              router.push('/admin/works');
            }
          }}
          disabled={saving || thumbnailProcessing}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}