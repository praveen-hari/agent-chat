/**
 * Tests for MarkdownContent component.
 */

import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MarkdownContent } from './MarkdownContent';
import { renderWithChat } from '../../test-utils/render';

describe('MarkdownContent', () => {
  test('renders markdown text', () => {
    renderWithChat(<MarkdownContent kind="markdown" content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  test('renders bold and italic text', () => {
    renderWithChat(<MarkdownContent kind="markdown" content="**bold** and *italic*" />);
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  test('renders links with target blank', () => {
    renderWithChat(<MarkdownContent kind="markdown" content="[Click here](https://example.com)" />);
    const link = screen.getByText('Click here');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });

  test('renders link with href attribute', () => {
    renderWithChat(<MarkdownContent kind="markdown" content="[link](https://example.com)" />);
    const link = screen.getByText('link').closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('returns null for empty content', () => {
    const { container } = renderWithChat(<MarkdownContent kind="markdown" content="" />);
    expect(container.querySelector('.ac-markdown')).not.toBeInTheDocument();
  });

  test('applies streaming class when streaming', () => {
    renderWithChat(<MarkdownContent kind="markdown" content="Streaming text" isStreaming />);
    expect(screen.getByTestId('markdown-content')).toHaveClass('ac-markdown--streaming');
  });

  test('renders unordered lists', () => {
    const { container } = renderWithChat(
      <MarkdownContent kind="markdown" content={'- item 1\n- item 2\n- item 3'} />,
    );
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(3);
  });

  test('renders inline code', () => {
    renderWithChat(<MarkdownContent kind="markdown" content="Use `console.log()` to debug" />);
    expect(screen.getByText('console.log()')).toBeInTheDocument();
  });
});
