import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, importPKCS8 } from 'jose';

const SC_API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

function isConfigured() {
  return !!(
    process.env.GOOGLE_SC_SITE_URL &&
    process.env.GA_CLIENT_EMAIL &&
    process.env.GA_PRIVATE_KEY
  );
}

// 서비스 계정 → OAuth2 액세스 토큰
async function getAccessToken(): Promise<string> {
  const privateKey = await importPKCS8(
    process.env.GA_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    'RS256'
  );

  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(process.env.GA_CLIENT_EMAIL!)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get access token');
  return data.access_token;
}

function getDateRange(range: string): { startDate: string; endDate: string } {
  const today = new Date();
  today.setDate(today.getDate() - 2); // Search Console 2~3일 지연 반영
  const days = range === '7daysAgo' ? 7 : range === '30daysAgo' ? 30 : 90;
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(today) };
}

async function querySearchConsole(
  token: string,
  siteUrl: string,
  body: object
) {
  const res = await fetch(
    `${SC_API}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const errBody = await res.text();
    console.error(`Search Console API ${res.status}:`, errBody);
    throw new Error(`Search Console API error: ${res.status} - ${errBody}`);
  }
  return res.json();
}

export async function GET(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'SC_NOT_CONFIGURED' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const dateRange = searchParams.get('dateRange') || '7daysAgo';
  const siteUrl = process.env.GOOGLE_SC_SITE_URL!;
  const { startDate, endDate } = getDateRange(dateRange);

  try {
    const token = await getAccessToken();

    const [summaryRes, dailyRes, queriesRes, pagesRes] = await Promise.all([
      // 전체 요약 (dimension 없음)
      querySearchConsole(token, siteUrl, { startDate, endDate, rowLimit: 1 }),
      // 일별 추이
      querySearchConsole(token, siteUrl, {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 90,
      }),
      // 검색 키워드
      querySearchConsole(token, siteUrl, {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 25,
      }),
      // 인기 페이지
      querySearchConsole(token, siteUrl, {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10,
      }),
    ]);

    // 요약
    const sr = summaryRes.rows?.[0] ?? {};
    const summary = {
      clicks: sr.clicks ?? 0,
      impressions: sr.impressions ?? 0,
      ctr: sr.ctr ?? 0,
      position: sr.position ?? 0,
    };

    // 일별 추이
    const dailyStats = (dailyRes.rows || []).map((row: any) => ({
      date: row.keys[0].slice(5), // YYYY-MM-DD → MM-DD
      clicks: row.clicks,
      impressions: row.impressions,
    }));

    // 검색 키워드
    const topQueries = (queriesRes.rows || []).map((row: any) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

    // 인기 페이지
    const topPages = (pagesRes.rows || []).map((row: any) => ({
      page: row.keys[0].replace(siteUrl.replace(/\/$/, ''), '') || '/',
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

    return NextResponse.json({ summary, dailyStats, topQueries, topPages });
  } catch (error) {
    console.error('Search Console API error:', error);
    return NextResponse.json({ error: 'SC_API_ERROR' }, { status: 500 });
  }
}
