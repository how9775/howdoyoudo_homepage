// IndexNow 소유 확인용 키 파일 (https://hdyd.co.kr/indexnow-key.txt)
export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return new Response('Not Found', { status: 404 });
  }
  return new Response(key, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
