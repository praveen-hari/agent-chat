import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  test('renders emoji icon', () => {
    render(<Avatar icon="🤖" name="Bot" />);
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  test('renders image when icon is src object', () => {
    render(<Avatar icon={{ src: 'https://example.com/avatar.png' }} name="User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(img).toHaveAttribute('alt', 'User');
  });

  test('renders iconId when icon is iconId object', () => {
    render(<Avatar icon={{ iconId: 'codicon-account' }} name="User" />);
    expect(screen.getByText('codicon-account')).toBeInTheDocument();
  });

  test('renders initials when icon is empty string', () => {
    render(<Avatar icon="" name="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  test('renders question mark when no icon and no name', () => {
    render(<Avatar icon="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('renders initials when image fails to load', () => {
    const { container } = render(<Avatar icon={{ src: 'bad-url.png' }} name="Alice" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    // Simulate image error via React's onError
    fireEvent(img!, new Event('error', { bubbles: true }));
    // After error, initials fallback should show
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('applies custom size via inline styles', () => {
    const { container } = render(<Avatar icon="🤖" size={32} />);
    expect(container.firstChild).toHaveStyle({ width: '32px', height: '32px' });
  });

  test('applies outline class when prop is set', () => {
    const { container } = render(<Avatar icon="🤖" outline />);
    expect(container.firstChild).toHaveClass('ac-avatar--outline');
  });

  test('has accessible img role with name', () => {
    render(<Avatar icon="🤖" name="Bot" />);
    expect(screen.getByRole('img', { name: 'Bot' })).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<Avatar icon="🤖" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  test('renders multi-char string as initials (not emoji)', () => {
    // Long strings are not emoji — should fall back to initials
    render(<Avatar icon="codicon-account" name="Bob" />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
