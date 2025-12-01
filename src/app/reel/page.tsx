'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, ThumbsUp, Clock } from 'lucide-react';
import type { YouTubeVideo } from '@/types/youtube';
import PageHeader from '@/components/sections/PageHeader';
import Image from 'next/image';

export default function ReelPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts'>('shorts');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setVideos([]);
    setNextPageToken(undefined);
    setHasMore(true);
    fetchVideos();
  }, [activeTab]);

  const fetchVideos = async (pageToken?: string) => {
    try {
      if (pageToken) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setVideos([]);
      }

      const url = `/api/youtube?type=${activeTab}${pageToken ? `&pageToken=${pageToken}` : ''}`;

      const response = await fetch(url);
      const data = await response.json();


      if (data.error) {
        console.error('API Error:', data.error, data.details);
        alert(`에러: ${data.error}\n${data.details || ''}`);
        return;
      }

      if (pageToken) {
        setVideos((prev) => [...prev, ...data.videos]);
      } else {
        setVideos(data.videos);
      }

      setNextPageToken(data.nextPageToken);
      setHasMore(!!data.nextPageToken);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      alert('영상을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(nextPageToken);
    }
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = match?.[1] ? parseInt(match[1]) : 0;
    const minutes = match?.[2] ? parseInt(match[2]) : 0;
    const seconds = match?.[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <PageHeader title='Reel' description='하우두유두의 최신 영상과 쇼츠를 만나보세요' />

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('shorts')}
            className={`pb-4 px-2 relative font-medium transition-colors ${activeTab === 'shorts' ? 'text-black' : 'text-gray-400'
              }`}
          >
            Shorts
            {activeTab === 'shorts' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-4 px-2 relative font-medium transition-colors ${activeTab === 'videos' ? 'text-black' : 'text-gray-400'
              }`}
          >
            동영상
            {activeTab === 'videos' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
              />
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Video Grid */}
        {!loading && (
          <>
            <motion.div
              className={`grid gap-6 ${activeTab === 'videos'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}
              layout
            >
              {videos.map((video, index) => (
                <motion.a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div
                    className={`relative overflow-hidden rounded-lg bg-gray-100 ${activeTab === 'shorts' ? 'aspect-[9/16]' : 'aspect-video'
                      }`}
                  >
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Play Button - 심플한 삼각형 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <path
                          d="M20 15 L20 45 L45 30 Z"
                          fill="white"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-3">
                    <h3 className="font-medium line-clamp-2 text-sm md:text-base text-black group-hover:text-red-600 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatCount(video.viewCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {formatCount(video.likeCount)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </motion.a>
              ))}
            </motion.div>

            {/* Empty State */}
            {videos.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-gray-400">영상이 없습니다.</p>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && videos.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      로딩 중...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}