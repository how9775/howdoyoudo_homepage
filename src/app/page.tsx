
import HeroSection from '@/components/sections/HeroSection'
import ImageGallery from '@/components/sections/ImageGallery'

export default function Home() {

  return (
    <div className="relative">
      {/* Hero Section */}
      <HeroSection />
      <section className="relative py-10 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" /> 
        {/* Animated Divider */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-on-scroll">
            <div className="inline-flex items-center space-x-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">
                Our Work
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
            </div>
          </div>
        </div>
      </section>
      
      <ImageGallery />
    </div>
  )
}