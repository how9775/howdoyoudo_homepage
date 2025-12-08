'use client';

import { WorkItem } from '@/types/works';
import Image from 'next/image';
import Link from 'next/link';

interface WorksGridProps {
    works: WorkItem[];
    loading: boolean;
    hasMore: boolean;
}

function WorkCard({ work }: { work: WorkItem }) {
    return (
        <Link href={`/works/${work.id}`} data-no-transition="true" className="group block">
            {/* 이미지 컨테이너 */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                {/* 썸네일 이미지 */}
                <Image
                    src={work.thumbnailImage}
                    alt={work.title}
                    fill
                    className="object-cover transition-all duration-500 md:group-hover:scale-110 md:group-hover:blur-sm"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* 카테고리 뱃지 (왼쪽 위) - 모바일에서 여백 축소 */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                    <span className="text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 bg-black bg-opacity-70 text-white rounded-full font-medium">
                        {work.categoryDisplayName}
                    </span>
                </div>

                {/* Hover Overlay - 데스크톱만 */}
                <div className="hidden md:block absolute inset-0 bg-white/0 group-hover:bg-white/40 transition-all duration-500">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-full flex items-center justify-center px-4">
                        <div className="text-center">
                            <h3
                                className="text-lg md:text-xl font-bold text-black mb-2 line-clamp-3 break-keep"
                                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
                            >
                                {work.title}
                            </h3>

                            <p className="text-sm text-gray-700 font-medium">
                                {`${work.eventDate.slice(0, 4)}.${work.eventDate.slice(5, 7)}.${work.eventDate.slice(8, 10)}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모바일 전용 제목/날짜 - 카드 아래 */}
            <div className="md:hidden mt-3 space-y-1">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 break-keep leading-tight">
                    {work.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                    {`${work.eventDate.slice(0, 4)}.${work.eventDate.slice(5, 7)}.${work.eventDate.slice(8, 10)}`}
                </p>
            </div>
        </Link>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                    <div className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse" />
                    {/* 모바일 스켈레톤 */}
                    <div className="md:hidden space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function WorksGrid({ works, loading, hasMore }: WorksGridProps) {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Works Grid */}
                {works.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {works.map((work) => (
                            <WorkCard key={work.id} work={work} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-sm sm:text-base md:text-lg">선택한 조건에 해당하는 작업이 없습니다.</p>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && <LoadingSkeleton />}

                {/* Load More Indicator */}
                {!loading && hasMore && works.length > 0 && (
                    <div className="text-center pt-8">
                        <div className="inline-flex items-center space-x-2 text-gray-400">
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-16 sm:w-20" />
                            <span className="text-xs sm:text-sm">스크롤하여 더 보기</span>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-16 sm:w-20" />
                        </div>
                    </div>
                )}

                {/* End Message */}
                {!hasMore && works.length > 0 && (
                    <div className="text-center pt-8">
                        <div className="inline-flex items-center space-x-2 text-gray-400">
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-16 sm:w-20" />
                            <span className="text-xs sm:text-sm">더 표시할 게시글이 없습니다</span>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-16 sm:w-20" />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}