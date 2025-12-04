'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Dashboard와 Admin 페이지에서는 헤더 숨김
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null;

  const navItems = [
    { href: '/', label: 'MAIN' },
    { href: '/about', label: 'ABOUT' },
    { href: '/history', label: 'HISTORY' },
    { href: '/works', label: 'WORKS' },
    { href: '/reel', label: 'REEL' },
    { href: '/contact', label: 'CONTACT' },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
          }`}
      >
        <div className="w-full px-4 sm:px-8 md:px-16 lg:px-32 xl:px-40">
          <div className="relative flex items-center justify-center md:justify-between h-14 sm:h-16 md:h-20">
            <Link
              href="/"
              className="relative h-6 w-auto sm:h-7 md:h-8 flex items-center"
            >
              <Image
                src="/images/logo/how_logo.png"
                alt="HOWDOYOUDO"
                width={150}
                height={50}
                className="h-full w-auto object-contain"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center space-x-12">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium tracking-wide transition-all duration-300 relative group ${pathname === item.href
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gray-900 transition-all duration-300 ${pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                  />
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="absolute right-0 md:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-40 transform transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="relative h-6 w-auto">
              <Image
                src="/images/logo/how_logo.png"
                alt="HOWDOYOUDO"
                width={80}
                height={27}
                className="h-full w-auto object-contain"
              />
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block text-lg font-medium transition-colors ${pathname === item.href ? 'text-gray-900' : 'text-gray-600'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}