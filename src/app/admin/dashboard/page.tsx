'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogOut, 
  Shield,
  FileText,
  Plus,
  Eye,
  Calendar,
  BarChart3,
  Settings,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminInfo {
  id: number;
  username: string;
  name: string;
  ip_address: string | null;
  last_login: string | null;
  login_count: number;
}

interface WorksStats {
  totalWorks: number;
  activeWorks: number;
  totalViews: number;
  recentWorks: {
    id: number;
    title: string;
    category_display_name: string;
    event_date: string;
    view_count: number;
    is_active: boolean;
  }[];
}

interface DailyVisit {
  date: string;
  clicks: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [worksStats, setWorksStats] = useState<WorksStats | null>(null);
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminInfo();
    fetchWorksStats();
    fetchSearchConsoleData();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch('/api/admin/auth/session');
      const data = await response.json();

      console.log(data);

      if (data.success) {
        setAdminInfo(data.admin);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('세션 정보 로드 오류:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorksStats = async () => {
    try {
      const response = await fetch('/api/admin/works/stats');
      const data = await response.json();

      if (data.success) {
        setWorksStats(data.stats);
      }
    } catch (error) {
      console.error('통계 정보 로드 오류:', error);
    }
  };

  const fetchSearchConsoleData = async () => {
    setChartLoading(true);
    try {
      const res = await fetch('/api/admin/analytics/google?dateRange=30daysAgo');
      if (!res.ok) return;
      const json = await res.json();
      const visits: DailyVisit[] = (json.dailyStats || []).map((d: { date: string; clicks: number }) => ({
        date: d.date,
        clicks: d.clicks,
      }));
      setDailyVisits(visits);
    } catch (error) {
      console.error('Search Console 데이터 로드 오류:', error);
    } finally {
      setChartLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 메뉴 카드 데이터
  const menuCards = [
    {
      title: 'Works 관리',
      description: '포트폴리오 작업물 관리',
      href: '/admin/works',
      stats: worksStats ? `${worksStats.activeWorks}개 활성` : '로딩 중...',
    },
    {
      title: '통계',
      description: '검색 유입 및 키워드 분석',
      href: '/admin/analytics',
      stats: worksStats ? `${worksStats.totalViews.toLocaleString()} 조회` : '로딩 중...',
    },
    {
      title: '연혁 관리',
      description: '연혁 항목 추가 및 수정',
      href: '/admin/history',
      stats: '관리자 설정',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            환영합니다, {adminInfo?.name}님!
          </h2>
          <p className="text-gray-300">
            HOWDOYOUDO 관리자 포털에 오신 것을 환영합니다.
          </p>
        </div>

        {/* Menu Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">빠른 메뉴</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {menuCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1`} />
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {card.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {card.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Console Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">검색 클릭 추이</h3>
              <p className="text-sm text-gray-600 mt-1">최근 30일간의 Google 검색 클릭 수</p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-900 mr-2"></div>
              <span className="text-sm text-gray-600">클릭</span>
            </div>
          </div>
          <div className="h-80">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                로딩 중...
              </div>
            ) : dailyVisits.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Search Console 데이터가 없습니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVisits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="클릭"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Works */}
        {worksStats && worksStats.recentWorks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">최근 작업물</h3>
                <Link
                  href="/admin/works"
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                >
                  전체 보기
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {worksStats.recentWorks.slice(0, 5).map((work) => (
                <div
                  key={work.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{work.title}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {work.category_display_name}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(work.event_date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="w-4 h-4 mr-1" />
                        {work.view_count.toLocaleString()}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          work.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {work.is_active ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}