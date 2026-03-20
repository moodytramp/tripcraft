import React from 'react';
import type { TCImageProps } from './types';

export function TCImage({ src, alt, style, className, testID, width, height }: TCImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      data-testid={testID}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
