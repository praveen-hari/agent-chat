/**
 * Tests for Avatar component.
 */

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  test('renders emoji icon', () => {
    render(<Avatar icon="🤖" name="Bot" />);
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  test('renders image with alt text', () => {
    const { container } = render(
      <Avatar icon={{ src: 'https://example.com/avatar.png' }} name="User" />,
    );
    const imgEl = container.querySelector('img.ac-avatar__img');
    expect(imgEl).toBeInTheDocument();
    expect(imgEl).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(imgEl).toHaveAttribute('alt', 'User');
  });

  test('renders initials when icon is empty string', () => {
    render(<Avatar icon="" name="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  test('renders ? when no name and no icon', () => {
    render(<Avatar icon="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('applies custom size', () => {
    const { container } = render(<Avatar icon="🤖" size={32} />);
    expect(container.firstChild).toHaveStyle({ width: '32px', height: '32px' });
  });

  test('applies default size of 24px', () => {
    const { container } = render(<Avatar icon="🤖" />);
    expect(container.firstChild).toHaveStyle({ width: '24px', height: '24px' });
  });

  test('shows outline when prop is set', () => {
    const { container } = render(<Avatar icon="🤖" outline />);
    expect(container.firstChild).toHaveClass('ac-avatar--outline');
  });

  test('has accessible role img', () => {
    render(<Avatar icon="🤖" name="Bot" />);
    expect(screen.getByRole('img', { name: 'Bot' })).toBeInTheDocument();
  });

  test('renders iconId variant', () => {
    const { container } = render(<Avatar icon={{ iconId: 'copilot' }} name="Copilot" />);
    expect(container.querySelector('.codicon-copilot')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<Avatar icon="🤖" className="my-avatar" />);
    expect(container.firstChild).toHaveClass('ac-avatar');
    expect(container.firstChild).toHaveClass('my-avatar');
  });
});
