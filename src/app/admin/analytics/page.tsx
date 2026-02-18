'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MousePointerClick, Eye, TrendingUp, Search,
  Loader2, AlertCircle, BarChart3, Link as LinkIcon,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── 타입 ────────────────────────────────────────────────

interface GoogleSummary {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface DailyStat {
  date: string;
  clicks: number;
  impressions: number;
}

interface TopQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface TopPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GoogleData {
  summary: GoogleSummary;
  dailyStats: DailyStat[];
  topQueries: TopQuery[];
  topPages: TopPage[];
}

type DateRange = '7daysAgo' | '30daysAgo' | '90daysAgo';

// ─── 유틸 ────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('ko-KR');
const fmtCtr = (v: number) => `${(v * 100).toFixed(1)}%`;
const fmtPos = (v: number) => v.toFixed(1);

// ─── 공통 컴포넌트 ────────────────────────────────────────

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="text-gray-400 mb-3">{icon}</div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function NotConfigured() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-amber-800 mb-2">환경 변수 설정이 필요합니다</p>
          <p className="text-sm text-amber-700 mb-3">Vercel → Settings → Environment Variables에 추가하세요.</p>
          <div className="space-y-1 mb-3">
            {['GOOGLE_SC_SITE_URL', 'GA_CLIENT_EMAIL', 'GA_PRIVATE_KEY'].map((k) => (
              <div key={k} className="text-xs font-mono bg-amber-100 text-amber-900 px-2 py-1 rounded">{k}</div>
            ))}
          </div>
          <p className="text-xs text-amber-600">
            Google Cloud Console에서 서비스 계정을 생성하고, Search Console에 뷰어 권한을 부여하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApiError() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-5">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="font-medium text-red-700">데이터를 불러오지 못했습니다</p>
      </div>
      <p className="text-sm text-red-500 mt-1">API 설정 및 권한을 확인하세요.</p>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7daysAgo');
  const [data, setData] = useState<GoogleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/analytics/google?dateRange=${dateRange}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'API_ERROR');
        return;
      }

      setData(json);
    } catch {
      setError('API_ERROR');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '7daysAgo', label: '최근 7일' },
    { value: '30daysAgo', label: '최근 30일' },
    { value: '90daysAgo', label: '최근 90일' },
  ];

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 날짜 필터 */}
        <div className="flex gap-2 mb-6">
          {dateRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dateRange === opt.value
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
          </div>
        )}

        {/* 에러 */}
        {!loading && error === 'SC_NOT_CONFIGURED' && <NotConfigured />}
        {!loading && error && error !== 'SC_NOT_CONFIGURED' && <ApiError />}

        {/* 콘텐츠 */}
        {!loading && !error && data && (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="총 클릭" value={fmt(data.summary.clicks)} icon={<MousePointerClick className="w-4 h-4" />} />
              <MetricCard label="총 노출" value={fmt(data.summary.impressions)} icon={<Eye className="w-4 h-4" />} />
              <MetricCard label="평균 CTR" value={fmtCtr(data.summary.ctr)} icon={<TrendingUp className="w-4 h-4" />} />
              <MetricCard label="평균 순위" value={fmtPos(data.summary.position)} icon={<BarChart3 className="w-4 h-4" />} />
            </div>

            {/* 일별 추이 */}
            <SectionCard title="클릭 · 노출 추이" icon={<BarChart3 className="w-4 h-4" />}>
              <div className="p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="clicks" name="클릭" stroke="#111827" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="impressions" name="노출" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 검색 키워드 */}
              <SectionCard title="검색 키워드" icon={<Search className="w-4 h-4" />}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <Th>키워드</Th>
                        <Th right>클릭</Th>
                        <Th right>노출</Th>
                        <Th right>CTR</Th>
                        <Th right>순위</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.topQueries.length > 0 ? data.topQueries.map((q, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-sm font-medium text-gray-900">{q.query}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{fmt(q.clicks)}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{fmt(q.impressions)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{fmtCtr(q.ctr)}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{fmtPos(q.position)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">데이터가 없습니다</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* 인기 페이지 */}
              <SectionCard title="인기 페이지" icon={<LinkIcon className="w-4 h-4" />}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <Th>페이지</Th>
                        <Th right>클릭</Th>
                        <Th right>노출</Th>
                        <Th right>CTR</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.topPages.length > 0 ? data.topPages.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.page || '/'}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{fmt(p.clicks)}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{fmt(p.impressions)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{fmtCtr(p.ctr)}</span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">데이터가 없습니다</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
