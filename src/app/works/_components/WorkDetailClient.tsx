'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Share2, Calendar, Tag, Check, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { WorkItem } from '@/types/works';

interface WorkDetailClientProps {
  initialData: {
    work: WorkItem;
    navigation: {
      prev: { id: number; title: string } | null;
      next: { id: number; title: string } | null;
    };
  };
}

export default function WorkDetailClient({ initialData }: WorkDetailClientProps) {
  const { work, navigation } = initialData;
  const [showCopyToast, setShowCopyToast] = useState(false);

  // 목록으로 돌아갈 때 카테고리 상태 복원
  const searchParams = useSearchParams();
  const fromCategory = searchParams.get('from');
  const listHref = fromCategory ? `/works?category=${fromCategory}` : '/works';

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: work.title, text: work.description, url });
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="font-medium">링크가 복사되었습니다</span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Top: 목록으로 버튼 */}
        <div className="flex items-center mb-6 sm:mb-8 pb-4 sm:pb-6">
          <Link
            href={listHref}
            data-no-transition="true"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-colors duration-300"
          >
            <List className="w-4 h-4" />
            목록으로
          </Link>
        </div>

        {/* Title Section */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight break-keep">
            {work.title}
          </h1>

          {/* Meta + Share */}
          <div className="flex justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">{work.categoryDisplayName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{formatDate(work.eventDate)}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full transition-colors w-fit text-xs sm:text-sm"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">공유하기</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
            {work.description}
          </p>
        </div>

        {/* Content Images */}
        {work.contentImages.length > 0 && (
          <div className="space-y-6 sm:space-y-8 md:space-y-12 mb-8 sm:mb-12 md:mb-16">
            {work.contentImages.map((imageUrl, index) => (
              <div key={index} className="w-full">
                <Image
                  src={imageUrl}
                  alt={`${work.title} - Image ${index + 1}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 pt-8 sm:pt-10 md:pt-12 mt-4">
          {/* 이전 / 목록으로 / 다음 — 3열 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 items-stretch">
            {/* 이전 게시물 */}
            <div>
              {navigation.prev ? (
                <Link
                  href={`/works/${navigation.prev.id}`}
                  data-no-transition="true"
                  className="group flex flex-col h-full p-4 sm:p-5 border border-gray-200 rounded-2xl hover:border-gray-900 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-wide">
                      이전
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-gray-600 transition-colors leading-snug">
                    {navigation.prev.title}
                  </p>
                </Link>
              ) : (
                <div className="h-full p-4 sm:p-5 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                  <span className="text-xs text-gray-300">이전 없음</span>
                </div>
              )}
            </div>

            {/* 목록으로 — 중앙 */}
            <div className="flex items-center justify-center">
              <Link
                href={listHref}
                data-no-transition="true"
                className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
              >
                목록으로
              </Link>
            </div>

            {/* 다음 게시물 */}
            <div>
              {navigation.next ? (
                <Link
                  href={`/works/${navigation.next.id}`}
                  data-no-transition="true"
                  className="group flex flex-col h-full p-4 sm:p-5 border border-gray-200 rounded-2xl hover:border-gray-900 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-end gap-1.5 mb-2">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-wide">
                      다음
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 text-right group-hover:text-gray-600 transition-colors leading-snug">
                    {navigation.next.title}
                  </p>
                </Link>
              ) : (
                <div className="h-full p-4 sm:p-5 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                  <span className="text-xs text-gray-300">다음 없음</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
