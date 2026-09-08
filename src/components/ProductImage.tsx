'use client';

import React, { useState } from 'react';
import { resolveProductImage } from '@/lib/images';

interface ProductImageProps {
  image?: string | null;
  alt: string;
  className?: string;
}

/**
 * Renders the product photo on top of an existing placeholder surface.
 * If the image is missing or fails to load, it unmounts and reveals the placeholder beneath.
 */
export function ProductImage({ image, alt, className }: ProductImageProps) {
  const url = resolveProductImage(image);
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return null;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
