import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';
import { darkTheme } from '../dark';
import { lightTheme } from '../light';

describe('ThemeProvider', () => {
  test('renders children', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <span>Hello Chat</span>
      </ThemeProvider>,
    );
    expect(screen.getByText('Hello Chat')).toBeInTheDocument();
  });

  test('applies ac-root class to wrapper', () => {
    const { container } = render(
      <ThemeProvider theme={darkTheme}>
        <span>Content</span>
      </ThemeProvider>,
    );
    expect(container.firstChild).toHaveClass('ac-root');
  });

  test('applies custom className alongside ac-root', () => {
    const { container } = render(
      <ThemeProvider theme={darkTheme} className="my-custom-class">
        <span>Content</span>
      </ThemeProvider>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('ac-root');
    expect(root).toHaveClass('my-custom-class');
  });

  test('sets CSS custom properties from dark theme', () => {
    const { container } = render(
      <ThemeProvider theme={darkTheme}>
        <span>Content</span>
      </ThemeProvider>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--ac-bg-primary')).toBe('#1e1e1e');
    expect(root.style.getPropertyValue('--ac-fg-primary')).toBe('#cccccc');
    expect(root.style.getPropertyValue('--ac-success')).toBe('#3fb950');
  });

  test('sets CSS custom properties from light theme', () => {
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <span>Content</span>
      </ThemeProvider>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--ac-bg-primary')).toBe('#ffffff');
    expect(root.style.getPropertyValue('--ac-fg-primary')).toBe('#333333');
  });

  test('updates CSS properties when theme changes', () => {
    const { container, rerender } = render(
      <ThemeProvider theme={darkTheme}>
        <span>Content</span>
      </ThemeProvider>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--ac-bg-primary')).toBe('#1e1e1e');

    rerender(
      <ThemeProvider theme={lightTheme}>
        <span>Content</span>
      </ThemeProvider>,
    );
    expect(root.style.getPropertyValue('--ac-bg-primary')).toBe('#ffffff');
  });

  test('sets every theme token as a CSS variable', () => {
    const { container } = render(
      <ThemeProvider theme={darkTheme}>
        <span>Content</span>
      </ThemeProvider>,
    );
    const root = container.firstChild as HTMLElement;
    const tokenCount = Object.keys(darkTheme).length;
    // Check that the inline style has at least as many properties as theme tokens
    // (style.cssText contains all of them)
    expect(root.style.length).toBeGreaterThanOrEqual(tokenCount);
  });
});
