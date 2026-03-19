import React from 'react';
import type { TCPressableProps } from './types.js';

export function TCPressable({
  children,
  style,
  className,
  testID,
  onPress,
  disabled,
  accessibilityRole,
  accessibilityLabel,
}: TCPressableProps) {
  return (
    <button
      type="button"
      style={{ border: 'none', background: 'none', cursor: disabled ? 'default' : 'pointer', padding: 0, ...style }}
      className={className}
      data-testid={testID}
      onClick={onPress}
      disabled={disabled}
      role={accessibilityRole || 'button'}
      aria-label={accessibilityLabel}
    >
      {children}
    </button>
  );
}
