// src/app/history/layout.tsx
import YearBar from "./_components/YearBar"

interface HistoryRow {
  id: number;
  year: string;
  date: string;
  description: string;
}

interface YearData {
  year: string;
  events: { date: string; description: string }[];
}

async function getHistoryYears() {
    try {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/history`
        const response = await fetch(url, {
            cache: 'no-store'
        })
        
        if (!response.ok) {
            console.error('History API error:', response.status)
            return []
        }
        
        const data: HistoryRow[] = await response.json()
        
        // 배열인지 확인
        if (!Array.isArray(data)) {
            console.error('History data is not an array:', data)
            return []
        }

        // 연도별로 그룹화
        const groupedByYear = data.reduce<Record<string, YearData>>((acc, item) => {
            if (!acc[item.year]) {
                acc[item.year] = {
                    year: item.year,
                    events: []
                }
            }
            acc[item.year].events.push({
                date: item.date,
                description: item.description
            })
            return acc
        }, {})

        // 객체를 배열로 변환하고 연도순으로 정렬
        const result = Object.values(groupedByYear).sort((a, b) => 
            parseInt(b.year) - parseInt(a.year)
        )

        console.log('Transformed history data:', result)
        return result
        
    } catch (error) {
        console.error('Failed to fetch history:', error)
        return []
    }
}

export default async function HistoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const companyHistory = await getHistoryYears()

    return (
        <>
            {children}
            <YearBar companyHistory={companyHistory}/>
        </>
    )
}