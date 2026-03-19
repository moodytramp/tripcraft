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

export type { TCViewProps, TCTextProps, TCPressableProps, TCImageProps } from './types.js';

// Default web implementations — mobile app overrides these via module resolution
export { TCView } from './TCView.js';
export { TCText } from './TCText.js';
export { TCPressable } from './TCPressable.js';
export { TCImage } from './TCImage.js';
