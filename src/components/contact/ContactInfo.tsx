import { MapPin, Mail, Phone } from "lucide-react";

interface ContactConfig {
  address: string;
  emails: string[];
  phone: string;
  fax: string;
}

interface ContactInfoProps {
  contactInfo: ContactConfig;
}

// 전화번호 포맷팅 (국제 형식으로 변환)
function formatPhoneInternational(phone: string): string {
  if (!phone) return '';
  
  // 한국 번호인 경우 +82로 시작하도록 변환
  if (phone.startsWith('02-')) {
    return `+82 2 ${phone.slice(3).replace('-', ' ')}`;
  } else if (phone.startsWith('0')) {
    return `+82 ${phone.slice(1).replace(/-/g, ' ')}`;
  }
  return phone;
}

export default function ContactInfo({ contactInfo }: ContactInfoProps) {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
      {/* Address */}
      <div className="text-center">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-transparent border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
          <MapPin className="w-4 h-4 md:w-6 md:h-6" />
        </div>
        <h3 className="text-[10px] md:text-sm font-semibold mb-1 md:mb-2 tracking-wider">ADDRESS:</h3>
        {contactInfo.address ? (
          <p className="text-[9px] md:text-sm text-gray-300 whitespace-pre-line">
            {contactInfo.address}
          </p>
        ) : (
          <>
            <p className="text-[9px] md:text-sm text-gray-300">서울시 금천구 벚꽃로 244</p>
            <p className="text-[9px] md:text-sm text-gray-300">벽산디지털밸리 5차 712호</p>
          </>
        )}
      </div>

      {/* Email */}
      <div className="text-center">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-transparent border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
          <Mail className="w-4 h-4 md:w-6 md:h-6" />
        </div>
        <h3 className="text-[10px] md:text-sm font-semibold mb-1 md:mb-2 tracking-wider">EMAIL:</h3>
        {contactInfo.emails && contactInfo.emails.length > 0 ? (
          contactInfo.emails.map((email, index) => (
            <p key={index} className="text-[9px] md:text-sm text-gray-300">
              {email}
            </p>
          ))
        ) : (
          <p className="text-[9px] md:text-sm text-gray-300">how9775@naver.com</p>
        )}
      </div>

      {/* Phone */}
      <div className="text-center">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-transparent border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
          <Phone className="w-4 h-4 md:w-6 md:h-6" />
        </div>
        <h3 className="text-[10px] md:text-sm font-semibold mb-1 md:mb-2 tracking-wider">CALL US:</h3>
        {contactInfo.phone ? (
          <>
            <p className="text-[9px] md:text-sm text-gray-300">
              {formatPhoneInternational(contactInfo.phone)}
            </p>
            {contactInfo.fax && (
              <p className="text-[9px] md:text-sm text-gray-300">
                FAX: {formatPhoneInternational(contactInfo.fax)}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-[9px] md:text-sm text-gray-300">+82 2 322 9775</p>
            <p className="text-[9px] md:text-sm text-gray-300">+82 2 6499 2525</p>
          </>
        )}
      </div>
    </div>
  );
}