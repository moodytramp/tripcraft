import type { CSSProperties, ReactNode } from 'react';

export interface TCViewProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  testID?: string;
  accessibilityRole?: string;
  accessibilityLabel?: string;
}

export interface TCTextProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  testID?: string;
  numberOfLines?: number;
  accessibilityRole?: string;
}

export interface TCPressableProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  testID?: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityRole?: string;
  accessibilityLabel?: string;
}

export interface TCImageProps {
  src: string;
  alt: string;
  style?: CSSProperties;
  className?: string;
  testID?: string;
  width?: number;
  height?: number;
}
