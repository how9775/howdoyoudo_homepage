'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

interface CTAButtonProps {
    href?: string;
    onClick?: () => void;
    invert?: boolean;
    children: React.ReactNode;
    className?: string;
    download?: boolean;
}

export default function CTAButton({
    href,
    onClick,
    invert = false,
    children,
    className,
    download = false,
}: CTAButtonProps) {
    const baseClasses =
        "group relative inline-block px-8 py-4 cursor-pointer rounded-full font-medium text-lg transition-all duration-300";

    const styles = invert
        ? "text-gray-900 border-1 border-gray-500"
        : "bg-gray-900 text-white hover:bg-gray-800";

    const gradientBg =
        invert
            ? "bg-gradient-to-r from-gray-200 to-gray-300"
            : "bg-gradient-to-r from-gray-800 to-gray-900";

    const inner = (
        <>
            <span className="relative z-10">{children}</span>
            <div
                className={clsx(
                    "absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    gradientBg
                )}
            />
        </>
    );

    if (href) {
        return (
            <Link
                download={download}
                href={href}
                className={clsx(baseClasses, styles, className)}
            >
                {inner}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className={clsx(baseClasses, styles, className)}
        >
            {inner}
        </button>
    );
}
