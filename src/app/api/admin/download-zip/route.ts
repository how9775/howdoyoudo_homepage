import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { urls, workId } = body as { urls: string[]; workId?: number | string };

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls 배열이 필요합니다.' }, { status: 400 });
  }

  const zip = new JSZip();

  await Promise.all(
    urls.map(async (url, i) => {
      const response = await fetch(url);
      if (!response.ok) return;
      const buffer = await response.arrayBuffer();
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      zip.file(`image_${String(i + 1).padStart(2, '0')}.${ext}`, buffer);
    })
  );

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
  const zipBlob = new Blob([zipBuffer], { type: 'application/zip' });
  const filename = workId
    ? `howdoyoudo_work_${workId}_image.zip`
    : 'howdoyoudo_images.zip';

  return new NextResponse(zipBlob, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
