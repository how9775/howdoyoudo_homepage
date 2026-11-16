import { revalidatePath, revalidateTag } from 'next/cache';

export const SITE_URL = 'https://hdyd.co.kr';
export const SITE_HOST = new URL(SITE_URL).host;

// works 관련 fetch 캐시 태그
export const WORKS_TAG = 'works';
export const workTag = (id: number | string) => `work:${id}`;

/**
 * works 생성/수정/삭제 후 관련 페이지(목록, 상세, sitemap)의 ISR 캐시를 즉시 무효화
 */
export function revalidateWorkPages(id?: number | string) {
  try {
    revalidateTag(WORKS_TAG);
    revalidatePath('/works');
    revalidatePath('/sitemap.xml');
    if (id !== undefined) {
      revalidateTag(workTag(id));
      revalidatePath(`/works/${id}`);
    }
  } catch (error) {
    console.error('Failed to revalidate work pages:', error);
  }
}

/**
 * IndexNow 프로토콜로 검색엔진(네이버, Bing 등)에 URL 변경을 즉시 알림
 * - INDEXNOW_KEY 환경변수가 없으면 아무것도 하지 않음
 * - 키 파일은 /indexnow-key.txt 에서 제공 (src/app/indexnow-key.txt/route.ts)
 * - Google은 IndexNow를 지원하지 않으므로 sitemap + Search Console로 수집됨
 */
export async function notifySearchEngines(paths: string[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || paths.length === 0) return;
  if (process.env.NODE_ENV !== 'production') return;

  const payload = {
    host: SITE_HOST,
    key,
    keyLocation: `${SITE_URL}/indexnow-key.txt`,
    urlList: paths.map((p) => (p.startsWith('http') ? p : `${SITE_URL}${p}`)),
  };

  const endpoints = [
    'https://searchadvisor.naver.com/indexnow',
    'https://api.indexnow.org/indexnow',
  ];

  const results = await Promise.allSettled(
    endpoints.map((endpoint) =>
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      })
    )
  );

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`IndexNow ping failed (${endpoints[i]}):`, result.reason);
    } else if (!result.value.ok) {
      console.error(`IndexNow ping failed (${endpoints[i]}): ${result.value.status}`);
    }
  });
}

/**
 * JSON-LD를 <script>에 안전하게 삽입하기 위한 직렬화 (</script> 주입 방지)
 */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
