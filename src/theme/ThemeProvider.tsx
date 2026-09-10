/**
 * ThemeProvider — injects theme tokens as CSS custom properties.
 *
 * Wraps children in a `<div>` with `--ac-*` CSS variables set as inline styles.
 * All CSS files reference these variables, enabling full theming.
 *
 * @module theme/ThemeProvider
 */

import { useMemo } from 'react';
import type { AgentChatTheme } from './tokens';
import { themeToStyleObject } from './themeUtils';
import { cn } from '../utils/cn';

export interface ThemeProviderProps {
  /** Theme token values to apply */
  theme: AgentChatTheme;
  /** Child elements to render within the themed container */
  children: React.ReactNode;
  /** Additional CSS class on the root element */
  className?: string;
}

/**
 * Provides theme tokens as CSS custom properties to all descendants.
 *
 * @example
 * ```tsx
 * <ThemeProvider theme={darkTheme}>
 *   <AgentChat />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  const style = useMemo(() => themeToStyleObject(theme), [theme]);

  return (
    <div className={cn('ac-root', className)} style={style}>
      {children}
    </div>
  );
}
