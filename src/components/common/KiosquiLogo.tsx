"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';

interface KiosquiLogoProps {
  height?: number;
  variant?: 'auto' | 'light' | 'dark';
  className?: string;
}

// Handoff #3 §5: el logo SIEMPRE va en versión transparente, embebido en el
// fondo. Las versiones *-bg (con caja de color) quedan como asset de marca
// pero no se usan en UI.
export default function KiosquiLogo({ height = 32, variant = 'auto', className }: KiosquiLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = variant === 'auto' ? resolvedTheme === 'dark' : variant === 'dark';
  const src = isDark
    ? '/brand/logo-cream-transparent.png' // wordmark cream para fondos oscuros
    : '/brand/logo-transparent.png';      // wordmark navy para fondos claros

  return (
    <Image
      src={src}
      alt="Kiosqui"
      height={height}
      width={Math.round(height * 5.29)}
      className={className}
      style={{ height, width: 'auto' }}
      priority
      // El optimizador de Next 13.4 falla con estos PNG exportados por diseño
      // ("Unable to optimize image…", HTTP 400) — se sirven crudos; son
      // wordmarks chicos, no hay ganancia real de optimización.
      unoptimized
    />
  );
}
