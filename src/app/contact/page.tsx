import PageHeader from "@/components/sections/PageHeader";
import KakaoMap from "@/components/ui/KakaoMap";
import { MapPin, Mail, Phone, Facebook, Youtube, Instagram } from "lucide-react";

export default function Page() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageHeader title='CONTACT US' description="오시는 길과 연락처" />

                {/* Main Contact Section */}
                <main className="flex-1 container mx-auto px-4 py-16">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left: Contact Information */}
                        <div className="lg:w-1/2 h-120 flex flex-col justify-center items-center bg-[#232225] text-white p-4 md:p-8">
                            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
                                {/* Address */}
                                <div className="text-center">
                                    <div className="w-10 h-10 md:w-16 md:h-16 bg-transparent border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                                        <MapPin className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-[10px] md:text-sm font-semibold mb-1 md:mb-2 tracking-wider">ADDRESS:</h3>
                                    <p className="text-[9px] md:text-sm text-gray-300">서울시 금천구 벚꽃로 244</p>
                                    <p className="text-[9px] md:text-sm text-gray-300">벽산디지털밸리 5차 712호</p>
                                </div>

                                {/* Email */}
                                <div className="text-center">
                                    <div className="w-10 h-10 md:w-16 md:h-16 bg-transparent border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                                        <Mail className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-[10px] md:text-sm font-semibold mb-1 md:mb-2 tracking-wider">EMAIL:</h3>
                                    <p className="text-[9px] md:text-sm text-gray-300">how9775@naver.com</p>
                                </div>

                                {/* Phone */}
                                <div className="text-center">
                                    <div className="w-10 h-10 md:w-16 md:h-16 bg-transparent border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                                        <Phone className="w-4 h-4 md:w-6 md:h-6" />
                                    </div>
                                    <h3 className="text-[10px] md:text-sm font-semibold mb-1 md:mb-2 tracking-wider">CALL US:</h3>
                                    <p className="text-[9px] md:text-sm text-gray-300">+82 2 322 9775</p>
                                    <p className="text-[9px] md:text-sm text-gray-300">+82 2 6499 2525</p>
                                </div>
                            </div>

                            {/* Contact Us */}
                            <div className="w-full text-center border-t border-gray-600 pt-6 md:pt-8">
                                <h3 className="text-[10px] md:text-sm font-semibold mb-6 md:mb-8 tracking-wider">CONTACT US</h3>
                                <div className="flex justify-center space-x-3 md:space-x-4">
                                    <a href="https://www.youtube.com/@howdoyoudo2025" className="w-7 h-7 md:w-8 md:h-8 bg-transparent border border-gray-500 rounded flex items-center justify-center hover:bg-white hover:text-gray-800 transition-colors">
                                        <Youtube className="w-3 h-3 md:w-4 md:h-4" />
                                    </a>
                                    <a href="#" className="w-7 h-7 md:w-8 md:h-8 bg-transparent border border-gray-500 rounded flex items-center justify-center hover:bg-white hover:text-gray-800 transition-colors">
                                        <Instagram className="w-3 h-3 md:w-4 md:h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right: Map */}
                        <div className="lg:w-1/2">
                            <div className="w-full h-120 rounded-lg overflow-hidden shadow-md">
                                <KakaoMap
                                    lat={37.476744}
                                    lng={126.885778}
                                    markerTitle="벽산디지털밸리5차"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}