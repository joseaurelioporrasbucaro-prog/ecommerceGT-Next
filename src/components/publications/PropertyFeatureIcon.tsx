"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import {
  getPropertyFallbackIcon,
  getPropertyIconPath,
  type PropertyFeature,
} from './publicationUtils';

interface PropertyFeatureIconProps {
  feature: PropertyFeature;
  size?: number;
  /** Color del icono cuando se usa el fallback de Font Awesome. */
  className?: string;
}

/**
 * Renderiza el SVG personalizado de Flaticon si existe en
 * `public/assets/img/property-icons/`, o el icono Font Awesome de fallback.
 *
 * El "if missing" se detecta vía onError de next/image: si el archivo no está
 * subido aún, automáticamente cae al icono Font Awesome sin romper la UI.
 */
const PropertyFeatureIcon = ({ feature, size = 20, className = '' }: PropertyFeatureIconProps) => {
  const [errored, setErrored] = useState(false);
  const iconPath = getPropertyIconPath(feature);
  const fallback = getPropertyFallbackIcon(feature);

  if (errored || !iconPath) {
    return <i className={`fal ${fallback} ${className}`} style={{ fontSize: size }} />;
  }

  return (
    <Image
      src={iconPath}
      alt=""
      width={size}
      height={size}
      onError={() => setErrored(true)}
      unoptimized
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
};

export default PropertyFeatureIcon;
