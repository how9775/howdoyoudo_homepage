'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, Clock, Loader2, BarChart3, Link as LinkIcon, Search, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  metrics: {
    activeUsers: { value: string; change: number };
    pageViews: { value: string; change: number };
    avgSessionDuration: { value: string; change: number };
    bounceRate: { value: string; change: number };
  };
  topPages: Array<{
    path: string;
    title: string;
    views: string;
    users: string;
  }>;
  referrers: Array<{
    source: string;
    sessions: string;
    percentage: number;
  }>;
  searchKeywords: Array<{
    keyword: string;
    clicks: string;
    impressions: string;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    users: number;
  }>;
}

interface AdminInfo {
  username: string;
  name: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('7daysAgo');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

  useEffect(() => {
    // 관리자 정보 가져오기
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdminInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
      }
    };

    fetchAdminInfo();
    loadDummyData();
  }, [dateRange]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      setData({
        metrics: {
          activeUsers: { value: '1234', change: 12.5 },
          pageViews: { value: '3456', change: 8.2 },
          avgSessionDuration: { value: '154', change: -3.1 },
          bounceRate: { value: '0.423', change: -5.4 },
        },
        topPages: [
          { path: '/', title: '홈', views: '1234', users: '890' },
          { path: '/works', title: '작업물', views: '892', users: '654' },
          { path: '/about', title: '소개', views: '567', users: '432' },
          { path: '/contact', title: '문의', views: '423', users: '321' },
          { path: '/history', title: '연혁', views: '345', users: '234' },
        ],
        referrers: [
          { source: 'google.com', sessions: '567', percentage: 45.2 },
          { source: 'naver.com', sessions: '342', percentage: 27.3 },
          { source: 'instagram.com', sessions: '189', percentage: 15.1 },
          { source: '직접 접속', sessions: '154', percentage: 12.4 },
        ],
        searchKeywords: [
          { keyword: '크리에이티브 에이전시', clicks: '123', impressions: '1234' },
          { keyword: '브랜딩 디자인', clicks: '89', impressions: '892' },
          { keyword: '하우두유두', clicks: '67', impressions: '567' },
          { keyword: '포트폴리오', clicks: '45', impressions: '423' },
        ],
        dailyStats: [
          { date: '11/24', views: 456, users: 234 },
          { date: '11/25', views: 523, users: 267 },
          { date: '11/26', views: 489, users: 245 },
          { date: '11/27', views: 612, users: 298 },
          { date: '11/28', views: 578, users: 276 },
          { date: '11/29', views: 645, users: 312 },
          { date: '11/30', views: 692, users: 334 },
        ],
      });
      setLoading(false);
    }, 500);
  };

  const formatDuration = (seconds: string) => {
    const sec = parseInt(seconds);
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString();
  };

  const maxViews = data ? Math.max(...data.dailyStats.map(d => d.views)) : 0;

  return (
    <div className="min-h-screen">

      {/* Main Content - Dashboard와 동일한 max-width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 날짜 범위 선택 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setDateRange('7daysAgo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange === '7daysAgo'
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            최근 7일
          </button>
          <button
            onClick={() => setDateRange('30daysAgo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange === '30daysAgo'
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            최근 30일
          </button>
          <button
            onClick={() => setDateRange('90daysAgo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange === '90daysAgo'
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            최근 90일
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              Google Analytics API 설정을 확인하세요
            </p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* 총 방문자 */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    data.metrics.activeUsers.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.metrics.activeUsers.change >= 0 ? '+' : ''}{data.metrics.activeUsers.change.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">총 방문자</p>
                <p className="text-2xl font-bold">{formatNumber(data.metrics.activeUsers.value)}</p>
              </div>

              {/* 페이지뷰 */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    data.metrics.pageViews.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.metrics.pageViews.change >= 0 ? '+' : ''}{data.metrics.pageViews.change.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">페이지뷰</p>
                <p className="text-2xl font-bold">{formatNumber(data.metrics.pageViews.value)}</p>
              </div>

              {/* 평균 세션 시간 */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    data.metrics.avgSessionDuration.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.metrics.avgSessionDuration.change >= 0 ? '+' : ''}{data.metrics.avgSessionDuration.change.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">평균 세션 시간</p>
                <p className="text-2xl font-bold">{formatDuration(data.metrics.avgSessionDuration.value)}</p>
              </div>

              {/* 이탈률 */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    data.metrics.bounceRate.change < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.metrics.bounceRate.change >= 0 ? '+' : ''}{data.metrics.bounceRate.change.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">이탈률</p>
                <p className="text-2xl font-bold">{(parseFloat(data.metrics.bounceRate.value) * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* 꺾은선 그래프 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-bold">방문 추이</h2>
              </div>
              <div className="h-64 flex items-end gap-2">
                {data.dailyStats.map((stat, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1">
                      <div className="text-xs text-gray-500 font-medium">{stat.views}</div>
                      <div
                        className="w-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${(stat.views / maxViews) * 200}px`, minHeight: '20px' }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">{stat.date}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">페이지뷰</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 페이지별 접속 통계 */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold">페이지별 접속 통계</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          페이지
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          조회수
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          방문자
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.topPages.map((page, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{page.title}</div>
                            <div className="text-sm text-gray-500">{page.path}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{formatNumber(page.views)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{formatNumber(page.users)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 접속 경로 */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold">접속 경로</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          소스
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          세션
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          비율
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.referrers.map((referrer, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{referrer.source}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatNumber(referrer.sessions)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {referrer.percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 검색 키워드 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold">검색 키워드</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        키워드
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        클릭
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        노출
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        클릭률
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.searchKeywords.map((keyword, index) => {
                      const ctr = (parseInt(keyword.clicks) / parseInt(keyword.impressions)) * 100;
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Search className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{keyword.keyword}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatNumber(keyword.clicks)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatNumber(keyword.impressions)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                              {ctr.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}