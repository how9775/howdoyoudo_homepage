import PageHeader from "@/components/sections/PageHeader";
import KakaoMap from "@/components/ui/KakaoMap";
import ContactInfo from "@/components/contact/ContactInfo";
import SocialLinks from "@/components/contact/SocialLinks";
import { getContactInfo } from "@/lib/getContactInfo";

export const revalidate = 60;

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
        </main>
      </div>
    </div>
  );
}