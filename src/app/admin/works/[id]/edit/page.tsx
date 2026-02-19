'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import WorkForm from '../../_components/WorkForm';
import { Loader2 } from 'lucide-react';

interface Work {
  id: number;
  title: string;
  category_id: number;
  description: string;
  event_date: string;
  thumbnail_image: string;
  content_images: string | string[];
  is_active: boolean | number;
}

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams();
  const workId = parseInt(params.id as string);

  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWork();
  }, [workId]);

  const loadWork = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/works/${workId}`);

      if (!response.ok) {
        throw new Error('Failed to load work');
      }

      const data = await response.json();

      if (data.success && data.work) {
        setWork(data.work);
      }
    } catch (error) {
      console.error('작업 로드 오류:', error);
      alert('작업을 불러올 수 없습니다.');
      router.push('/admin/works');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">작업을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/admin/works')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  // content_images 파싱
  let existingImages: string[] = [];
  if (work.content_images) {
    try {
      existingImages =
        typeof work.content_images === 'string'
          ? JSON.parse(work.content_images)
          : work.content_images;
    } catch (e) {
      existingImages = [];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">게시글 수정</h1>
              <p className="text-sm text-gray-600 mt-1">게시글 정보를 수정합니다</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <WorkForm
            mode="edit"
            workId={workId}
            initialData={{
              title: work.title,
              categoryId: work.category_id,
              description: work.description,
              eventDate: work.event_date.split('T')[0]
            }}
            existingThumbnail={work.thumbnail_image}
            existingImages={existingImages}
          />
        </div>
      </main>
    </div>
  );
}