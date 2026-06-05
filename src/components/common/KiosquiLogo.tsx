"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';

interface KiosquiLogoProps {
  height?: number;
  variant?: 'auto' | 'light' | 'dark';
}

export default function KiosquiLogo({ height = 32, variant = 'auto' }: KiosquiLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = variant === 'auto' ? resolvedTheme === 'dark' : variant === 'dark';
  const src = isDark
    ? '/brand/logo-navy-bg.png'   // wordmark cream para fondos oscuros
    : '/brand/logo-cream-bg.png'; // wordmark navy para fondos claros

  return (
    <Image src={src} alt="Kiosqui" height={height} width={height * 3.4} priority />
  );
}
