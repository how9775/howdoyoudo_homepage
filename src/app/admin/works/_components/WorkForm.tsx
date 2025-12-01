// src/app/admin/works/_components/WorkForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CategoryManager from './CategoryManager';
import ImageUploader from './ImageUploader';
import { Save, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageFile {
  file: File;
  preview: string;
}

interface WorkFormData {
  title: string;
  categoryId: number | null;
  description: string;
  eventDate: string;
  isActive: boolean;
}

interface WorkFormProps {
  initialData?: WorkFormData;
  workId?: number;
  mode: 'create' | 'edit';
  existingThumbnail?: string;
  existingImages?: string[];
}

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
    isActive: true,
    ...initialData,
  });

  // 썸네일 관리
  const [thumbnailFile, setThumbnailFile] = useState<ImageFile | null>(null);
  const [keepExistingThumbnail, setKeepExistingThumbnail] = useState<string | null>(
    existingThumbnail || null
  );

  // 콘텐츠 이미지 관리
  const [newContentImages, setNewContentImages] = useState<ImageFile[]>([]);
  const [keepExistingImages, setKeepExistingImages] = useState<string[]>(existingImages);

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState('');

  // Cleanup: 컴포넌트 언마운트 시 preview URL 정리
  useEffect(() => {
    return () => {
      if (thumbnailFile) {
        URL.revokeObjectURL(thumbnailFile.preview);
      }
      newContentImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [thumbnailFile, newContentImages]);

  // 썸네일 선택
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('지원하지 않는 파일 형식입니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    // 기존 미리보기 URL 정리
    if (thumbnailFile) {
      URL.revokeObjectURL(thumbnailFile.preview);
    }

    setThumbnailFile({
      file,
      preview: URL.createObjectURL(file),
    });
    setKeepExistingThumbnail(null); // 새 썸네일 선택 시 기존 썸네일 제거

    e.target.value = '';
  };

  // 썸네일 삭제
  const handleRemoveThumbnail = () => {
    if (thumbnailFile) {
      URL.revokeObjectURL(thumbnailFile.preview);
      setThumbnailFile(null);
    }
    setKeepExistingThumbnail(null);
  };

  // 기존 콘텐츠 이미지 삭제
  const handleRemoveExistingImage = (url: string) => {
    setKeepExistingImages((prev) => prev.filter((img) => img !== url));
  };

  // 이미지 업로드 함수
  const uploadImage = async (imageFile: ImageFile): Promise<string> => {
    const formData = new FormData();
    formData.append('file', imageFile.file);

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

    // Validation
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    // 썸네일 체크 (기존 or 새로운)
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
    setUploadProgress('');

    try {
      let thumbnailUrl = keepExistingThumbnail || '';
      const newImageUrls: string[] = [];

      // 썸네일 업로드 (새로 선택한 경우)
      if (thumbnailFile) {
        setUploadProgress('썸네일 업로드 중...');
        thumbnailUrl = await uploadImage(thumbnailFile);
      }

      // 콘텐츠 이미지 업로드 (새로 추가한 경우)
      if (newContentImages.length > 0) {
        for (let i = 0; i < newContentImages.length; i++) {
          setUploadProgress(
            `콘텐츠 이미지 업로드 중... (${i + 1}/${newContentImages.length})`
          );
          const url = await uploadImage(newContentImages[i]);
          newImageUrls.push(url);
        }
      }

      setUploadProgress('게시글 저장 중...');

      // 최종 콘텐츠 이미지 배열: 기존 이미지 + 새 이미지
      const finalContentImages = [...keepExistingImages, ...newImageUrls];

      const url =
        mode === 'create' ? '/api/admin/works' : `/api/admin/works/${workId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const requestBody: any = {
        title: formData.title.trim(),
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        thumbnailImage: thumbnailUrl,
        contentImages: finalContentImages,
        isActive: formData.isActive,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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
      setUploadProgress('');
    }
  };

  const totalContentImages = keepExistingImages.length + newContentImages.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-800 text-sm font-medium">{uploadProgress}</p>
          </div>
        </div>
      )}

      {/* Title */}
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

      {/* Category */}
      <CategoryManager
        selectedCategoryId={formData.categoryId}
        onCategoryChange={(categoryId) => setFormData({ ...formData, categoryId })}
      />

      {/* Event Date */}
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

      {/* Description */}
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

      {/* Thumbnail */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">썸네일 이미지 *</label>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          {/* 현재 썸네일 미리보기 */}
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
                {/* 삭제 버튼 */}
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

          {/* 썸네일 선택 버튼 */}
          <label
            htmlFor="thumbnail-upload"
            className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
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
            disabled={saving}
          />
        </div>
      </div>

      {/* Content Images */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          콘텐츠 이미지 ({totalContentImages}개)
        </label>

        {/* 기존 이미지 */}
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

                  {/* 순서 표시 */}
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </div>

                  {/* 삭제 버튼 */}
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

        {/* 새 이미지 업로드 */}
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

      {/* Is Active */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={saving}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          게시글 활성화
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 pt-6 border-t-2 border-gray-200">
        <button
          type="submit"
          disabled={saving}
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
          disabled={saving}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}