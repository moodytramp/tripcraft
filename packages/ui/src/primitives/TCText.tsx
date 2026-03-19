import React from 'react';
import type { TCTextProps } from './types.js';

export function TCText({ children, style, className, testID, numberOfLines, accessibilityRole }: TCTextProps) {
  const clampStyle: React.CSSProperties = numberOfLines
    ? {
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
      }
    : {};

  return (
    <span
      style={{ ...clampStyle, ...style }}
      className={className}
      data-testid={testID}
      role={accessibilityRole}
    >
      {children}
    </span>
  );
}
