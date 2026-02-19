import { Suspense } from 'react'
import LoginForm from '@/components/admin/LoginForm'

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-4">
                            HOWDOYOUDO 관리자 페이지
                        </h1>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="animate-pulse space-y-6">
                            <div className="h-12 bg-white/10 rounded-lg"></div>
                            <div className="h-12 bg-white/10 rounded-lg"></div>
                            <div className="h-12 bg-white/10 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}