// src/app/history/layout.tsx
import YearBar from "./_components/YearBar"

async function getHistoryYears() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/history`, {
            cache: 'no-store'
        })
        
        if (!response.ok) return []
        
        const data = await response.json()
        return data
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