/**
 * Cross-platform primitive abstractions.
 *
 * On React Native, these map to RN components (View, Text, Pressable).
 * On web, these map to HTML elements (div, span/p, button).
 *
 * This layer exists so shared components in @tripcraft/ui can be written once
 * and rendered on both platforms. Each app (mobile/web) re-exports these
 * primitives with platform-specific implementations.
 */

export type { TCViewProps, TCTextProps, TCPressableProps, TCImageProps } from './types';

// Default web implementations — mobile app overrides these via module resolution
export { TCView } from './TCView';
export { TCText } from './TCText';
export { TCPressable } from './TCPressable';
export { TCImage } from './TCImage';
