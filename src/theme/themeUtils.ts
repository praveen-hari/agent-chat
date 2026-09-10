/**
 * Theme utility functions for converting theme tokens to CSS custom properties.
 *
 * @module theme/themeUtils
 */

import type { AgentChatTheme } from './tokens';

/** CSS variable prefix for all agent-chat tokens */
const CSS_VAR_PREFIX = '--ac-';

/**
 * Converts a camelCase theme key to a kebab-case CSS variable name.
 *
 * @example
 * themeKeyToCssVar('bgPrimary') // → '--ac-bg-primary'
 * themeKeyToCssVar('borderInputFocus') // → '--ac-border-input-focus'
 * themeKeyToCssVar('fontSizeXxl') // → '--ac-font-size-xxl'
 */
export function themeKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `${CSS_VAR_PREFIX}${kebab}`;
}

/**
 * Converts an entire AgentChatTheme object into a CSS custom properties map.
 * Used by ThemeProvider to inject variables into the DOM.
 *
 * @example
 * themeToStyleObject(darkTheme)
 * // → { '--ac-bg-primary': '#1e1e1e', '--ac-fg-primary': '#cccccc', ... }
 */
export function themeToStyleObject(theme: AgentChatTheme): Record<string, string> {
  const styles: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) {
    styles[themeKeyToCssVar(key)] = value;
  }
  return styles;
}

/**
 * Generates a CSS string of custom property declarations from a theme.
 * Useful for SSR or generating static CSS.
 *
 * @example
 * themeToCssString(darkTheme)
 * // → '--ac-bg-primary: #1e1e1e;\n--ac-fg-primary: #cccccc;\n...'
 */
export function themeToCssString(theme: AgentChatTheme): string {
  return Object.entries(theme)
    .map(([key, value]) => `${themeKeyToCssVar(key)}: ${value};`)
    .join('\n');
}
