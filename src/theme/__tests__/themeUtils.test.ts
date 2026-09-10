import { describe, test, expect } from 'vitest';
import { themeKeyToCssVar, themeToStyleObject, themeToCssString } from '../themeUtils';
import { darkTheme } from '../dark';
import { lightTheme } from '../light';

describe('themeKeyToCssVar', () => {
  test('converts simple camelCase to kebab-case with prefix', () => {
    expect(themeKeyToCssVar('bgPrimary')).toBe('--ac-bg-primary');
  });

  test('converts multi-word camelCase', () => {
    expect(themeKeyToCssVar('borderInputFocus')).toBe('--ac-border-input-focus');
  });

  test('handles single-word keys', () => {
    expect(themeKeyToCssVar('success')).toBe('--ac-success');
  });

  test('handles consecutive uppercase (abbreviation-like)', () => {
    expect(themeKeyToCssVar('fontSizeXl')).toBe('--ac-font-size-xl');
    expect(themeKeyToCssVar('fontSizeXxl')).toBe('--ac-font-size-xxl');
  });

  test('handles spacing keys', () => {
    expect(themeKeyToCssVar('spaceXxs')).toBe('--ac-space-xxs');
    expect(themeKeyToCssVar('space3xl')).toBe('--ac-space3xl');
  });
});

describe('themeToStyleObject', () => {
  test('converts dark theme to CSS variable map', () => {
    const styles = themeToStyleObject(darkTheme);

    expect(styles['--ac-bg-primary']).toBe('#1e1e1e');
    expect(styles['--ac-fg-primary']).toBe('#cccccc');
    expect(styles['--ac-success']).toBe('#3fb950');
    expect(styles['--ac-font-size-base']).toBe('13px');
    expect(styles['--ac-radius-sm']).toBe('4px');
  });

  test('converts light theme to CSS variable map', () => {
    const styles = themeToStyleObject(lightTheme);

    expect(styles['--ac-bg-primary']).toBe('#ffffff');
    expect(styles['--ac-fg-primary']).toBe('#333333');
    expect(styles['--ac-success']).toBe('#22863a');
  });

  test('produces a key for every theme token', () => {
    const darkStyles = themeToStyleObject(darkTheme);
    const darkKeys = Object.keys(darkTheme);
    const styleKeys = Object.keys(darkStyles);

    expect(styleKeys.length).toBe(darkKeys.length);
  });

  test('all values are strings', () => {
    const styles = themeToStyleObject(darkTheme);
    for (const value of Object.values(styles)) {
      expect(typeof value).toBe('string');
    }
  });

  test('all keys start with --ac-', () => {
    const styles = themeToStyleObject(darkTheme);
    for (const key of Object.keys(styles)) {
      expect(key.startsWith('--ac-')).toBe(true);
    }
  });
});

describe('themeToCssString', () => {
  test('generates valid CSS declarations', () => {
    const css = themeToCssString(darkTheme);

    expect(css).toContain('--ac-bg-primary: #1e1e1e;');
    expect(css).toContain('--ac-fg-primary: #cccccc;');
    expect(css).toContain('--ac-radius-sm: 4px;');
  });

  test('generates one declaration per line', () => {
    const css = themeToCssString(darkTheme);
    const lines = css.split('\n');

    expect(lines.length).toBe(Object.keys(darkTheme).length);
    for (const line of lines) {
      expect(line).toMatch(/^--ac-.+: .+;$/);
    }
  });
});

describe('darkTheme', () => {
  test('has all required token keys', () => {
    const requiredKeys = [
      'bgPrimary',
      'fgPrimary',
      'success',
      'error',
      'border',
      'buttonPrimaryBg',
      'shimmer',
      'fontFamily',
      'fontSizeBase',
      'radiusSm',
      'avatarSize',
      'shadowCard',
      'transitionFast',
    ];
    for (const key of requiredKeys) {
      expect(darkTheme).toHaveProperty(key);
      expect(typeof (darkTheme as Record<string, string>)[key]).toBe('string');
    }
  });

  test('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(darkTheme)) {
      expect(value, `${key} should be a non-empty string`).toBeTruthy();
      expect(typeof value).toBe('string');
    }
  });
});

describe('lightTheme', () => {
  test('overrides dark theme backgrounds to lighter values', () => {
    expect(lightTheme.bgPrimary).toBe('#ffffff');
    expect(lightTheme.bgCode).toBe('#f5f5f5');
  });

  test('overrides dark theme foregrounds to darker values', () => {
    expect(lightTheme.fgPrimary).toBe('#333333');
    expect(lightTheme.fgLink).toBe('#006ab1');
  });

  test('preserves shared values from dark theme', () => {
    // Spacing, typography, radii should be the same
    expect(lightTheme.spaceXl).toBe(darkTheme.spaceXl);
    expect(lightTheme.fontFamily).toBe(darkTheme.fontFamily);
    expect(lightTheme.radiusSm).toBe(darkTheme.radiusSm);
    expect(lightTheme.avatarSize).toBe(darkTheme.avatarSize);
  });

  test('has same keys as dark theme', () => {
    const darkKeys = Object.keys(darkTheme).sort();
    const lightKeys = Object.keys(lightTheme).sort();
    expect(lightKeys).toEqual(darkKeys);
  });
});
