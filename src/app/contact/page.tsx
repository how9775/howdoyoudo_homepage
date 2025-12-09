import PageHeader from "@/components/sections/PageHeader";
import KakaoMap from "@/components/ui/KakaoMap";
import ContactInfo from "@/components/contact/ContactInfo";
import SocialLinks from "@/components/contact/SocialLinks";
import { getContactInfo } from "@/lib/getContactInfo";
import ContactForm from "@/components/contact/ContactForm";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  description: '하우두유두에 문의하세요. 서울시 금천구 벚꽃로 244 벽산디지털밸리 5차 712호에 위치하고 있습니다. BTL 마케팅, Corporate Event, Exhibition 등 통합 프로모션 서비스에 대해 상담해드립니다.',
  keywords: [
    '문의',
    '연락처',
    '오시는 길',
    '벽산디지털밸리',
    '금천구',
    '상담',
    'BTL 마케팅 상담',
    '이벤트 문의'
  ],
  openGraph: {
    title: 'Contact | HOWDOYOUDO',
    description: '하우두유두 연락처 및 오시는 길 - 서울시 금천구 벽산디지털밸리 5차',
    type: 'website',
    images: {
      url: '/howdoyoudo_siteImage.png.png',
      width: 1200,
      height: 630,
      alt: 'HOWDOYOUDO Open Graph Image',
    }
  }
}

export default async function ContactPage() {
  // Server에서 Contact 정보 가져오기 (SSR)
  const contactInfo = await getContactInfo();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader title='CONTACT US' description="오시는 길과 연락처" />

        {/* Main Contact Section */}
        <main className="flex-1 container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Contact Information */}
            <div className="lg:w-1/2 lg:h-120 flex flex-col items-center bg-[#232225] text-white px-3 pt-6 pb-4 sm:px-6 sm:pt-10 sm:pb-8 md:p-8 md:justify-center">
              {/* 연락처 정보 (Server Component) */}
              <ContactInfo contactInfo={contactInfo} />

              {/* 소셜 링크 (Client Component) */}
              <SocialLinks />
            </div>

            {/* Right: Map (Client Component) */}
            <div className="lg:w-1/2">
              <div className="w-full h-60 sm:h-120 rounded-lg overflow-hidden shadow-md">
                <KakaoMap
                  lat={37.476744}
                  lng={126.885778}
                  markerTitle="벽산디지털밸리5차"
                />
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="mt-16">
            <ContactForm />
          </div>
        </main>
      </div>
    </div>
  );
}