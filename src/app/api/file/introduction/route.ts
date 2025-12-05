import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const endPoint = process.env.R2_ENDPOINT;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucketName = process.env.R2_BUCKET_NAME;
        const publicDomain = process.env.R2_PUBLIC_DOMAIN;

        if (!endPoint || !accessKeyId || !secretAccessKey || !bucketName || !publicDomain) {
            return NextResponse.json({ error: 'R2 environment variables missing' }, { status: 500 });
        }

        const client = new S3Client({
            region: 'auto',
            endpoint: endPoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        const prefix = `howdoyoudo/files/introduction/`;

        const list = await client.send(
            new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
            })
        );

        if (!list.Contents || list.Contents.length === 0) {
            return NextResponse.json({ error: 'No introduction file found' }, { status: 404 });
        }

        const pdfFile = list.Contents.find(item => item.Key?.endsWith('.pdf'));
        
        if (!pdfFile || !pdfFile.Key) {
            return NextResponse.json({ error: 'No PDF file found' }, { status: 404 });
        }

        // URL 인코딩 (한글, 공백 처리)
        const encodedKey = pdfFile.Key.split('/').map(encodeURIComponent).join('/');
        const downloadUrl = `${publicDomain}/${encodedKey}`;

        console.log("PDF URL:", downloadUrl);

        return NextResponse.redirect(downloadUrl, 302);

    } catch (error) {
        console.error('Failed to get PDF:', error);
        return NextResponse.json({ error: 'Failed to get PDF' }, { status: 500 });
    }
}