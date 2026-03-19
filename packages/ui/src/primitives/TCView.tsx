import React from 'react';
import type { TCViewProps } from './types.js';

export function TCView({ children, style, className, testID, accessibilityRole, accessibilityLabel }: TCViewProps) {
  return (
    <div
      style={style}
      className={className}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
    >
      {children}
    </div>
  );
}
