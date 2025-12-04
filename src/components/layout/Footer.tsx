'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Dashboard와 Admin 페이지에서는 푸터 숨김
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }

  const businessFields = [
    'BTL Promotion',
    '런칭쇼케이스',
    '팝업스토어',
    '스타일링클래스',
    '에이전시',
    '전시',
    '뷰티클래스',
    '패션쇼',
    'CSR'
  ]

  const navItems = [
    { href: '/', label: 'MAIN' },
    { href: '/about', label: 'ABOUT' },
    { href: '/history', label: 'HISTORY' },
    { href: '/works', label: 'WORKS' },
    { href: '/contact', label: 'CONTACT' },
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="w-full px-4 sm:px-8 md:px-16 lg:px-32 xl:px-40">
        <div className="py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Company Info */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/logo/how_logo.png"
                  alt="HOWDOYOUDO"
                  width={100}
                  height={33}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div className="space-y-2 md:space-y-3 text-gray-600 text-xs sm:text-sm md:text-base">
                <p>
                  <span className="font-medium">Company Name</span><br />
                  (주)하우두유두
                </p>
                <p>
                  <span className="font-medium">CEO</span><br />
                  김덕원
                </p>
                <p>
                  <span className="font-medium">Incorporation</span><br />
                  2005년 02월
                </p>
              </div>
            </div>

            {/* Business Fields */}
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-base md:text-lg font-semibold text-gray-900 tracking-wide">
                FIELD OF BUSINESS
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {businessFields.map((field, index) => (
                  <span
                    key={index}
                    className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-base md:text-lg font-semibold text-gray-900 tracking-wide">
                QUICK LINKS
              </h4>
              <nav className="space-y-2 md:space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-xs sm:text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 md:pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <p className="text-xs sm:text-sm text-gray-500">
                © {currentYear} <span className="text-red-500 font-medium">howdoyoudo</span>. All Rights Reserved.
              </p>

              <div className="flex space-x-4 sm:space-x-6">
                <Link
                  href="/privacy"
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}