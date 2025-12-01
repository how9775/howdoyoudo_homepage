import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/db';

// GET - 모든 history 조회 (관리자용)
export async function GET() {
  try {
    const rows = await query(
      'SELECT * FROM history ORDER BY CAST(year AS UNSIGNED) DESC, date DESC'
    );
    
    // 배열인지 확인
    if (!Array.isArray(rows)) {
      console.error('Query did not return an array:', rows);
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch histories:', error);
    return NextResponse.json([], { status: 200 });
  }
}


// POST - 새 history 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, date, description } = body;

    if (!year || !date || !description) {
      return NextResponse.json(
        { error: 'Year, date, and description are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO history (year, date, description) VALUES (?, ?, ?)',
      [year, date, description]
    );

    return NextResponse.json(
      { message: 'History created', id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create history:', error);
    return NextResponse.json(
      { error: 'Failed to create history' },
      { status: 500 }
    );
  }
}