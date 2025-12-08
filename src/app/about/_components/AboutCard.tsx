'use client';

import { motion } from 'framer-motion';
import React, { ReactNode, useState, useRef } from 'react';
import Image from 'next/image';

interface AboutCardProps {
  title: string;
  subtitle: string;
  headline: ReactNode;
  description: string[];
  reverse?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  trackingWidth?: number;
}

export default function AboutCard({
  title,
  subtitle,
  headline,
  description,
  reverse = false,
  gradientFrom = '#0F172A',
  gradientTo = '#1E293B',
  backgroundImage,
  trackingWidth = 0,
}: AboutCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className={`flex flex-col lg:flex-row items-stretch gap-6 sm:gap-8 ${reverse ? 'lg:flex-row-reverse' : ''
        }`}
    >
      {/* Image Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{
          scale: 1.03,
          rotateY: reverse ? -2 : 2,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full lg:w-[480px] h-[350px] sm:h-[450px] lg:h-[500px] overflow-hidden cursor-pointer"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background Image with Grayscale Filter */}
        {backgroundImage && (
          <div className="absolute inset-0">
            <Image
              src={backgroundImage}
              alt={title}
              fill
              className="object-cover"
              style={{
                filter: 'grayscale(100%)',
              }}
              sizes="(max-width: 768px) 100vw, 480px"
              priority
            />
          </div>
        )}

        {/* Navy Gradient Overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: backgroundImage
              ? `linear-gradient(135deg, ${gradientFrom}dd, ${gradientTo}ee)`
              : `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            opacity: 0.85,
          }}
        />

        {/* Interactive Glow Effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            animate={{
              background: `radial-gradient(circle 180px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.15), transparent 70%)`,
            }}
            transition={{ type: 'tween', ease: 'linear', duration: 0 }}
          />
        )}

        {/* Title & Subtitle Overlay */}
        <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-2 sm:space-y-3"
          >
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-0">
              {title}
            </div>
            <p className={`text-lg sm:text-xl lg:text-2xl font-light text-white/90 ml-1`}  style={{ letterSpacing: trackingWidth ? `${trackingWidth}em` : undefined }}>
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Border Shadow */}
        <div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            boxShadow: reverse
              ? 'inset -8px 0 24px rgba(0,0,0,0.3)'
              : 'inset 8px 0 24px rgba(0,0,0,0.3)',
          }}
        />
      </motion.div>

      {/* Text Content Section */}
      <div className={`flex-1 flex items-center px-4 sm:px-6 mt-8 lg:mt-0 ${reverse ? "lg:mr-12" : "lg:ml-12"}`}>
        <motion.div
          initial={{ opacity: 0, x: reverse ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-6 sm:space-y-8 max-w-2xl"
        >
          {/* Headline with accent */}
          <div>
            <div className="inline-block">
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed text-gray-900">
                {headline}
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="h-0.5 sm:h-1 bg-gradient-to-r from-gray-900 to-gray-500 mt-3 sm:mt-4"
                style={{ transformOrigin: reverse ? 'right' : 'left' }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 sm:space-y-5">
            {description.map((line, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + idx * 0.1, duration: 0.5 }}
                className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-700 mb-0"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}