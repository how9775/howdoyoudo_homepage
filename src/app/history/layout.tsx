import YearBar from "./_components/YearBar"
import { getHistoryData } from "@/lib/history"

export default async function HistoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const companyHistory = await getHistoryData()

    return (
        <>
            {children}
            <YearBar companyHistory={companyHistory}/>
        </>
    )
}