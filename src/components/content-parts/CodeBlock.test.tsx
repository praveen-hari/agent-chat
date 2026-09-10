/**
 * Tests for CodeBlock component.
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlock } from './CodeBlock';
import { renderWithChat } from '../../test-utils/render';

describe('CodeBlock', () => {
  test('renders code content', () => {
    renderWithChat(<CodeBlock kind="code" code="const x = 1" language="typescript" />);
    expect(screen.getByText('const x = 1')).toBeInTheDocument();
  });

  test('displays language label', () => {
    renderWithChat(<CodeBlock kind="code" code="x = 1" language="python" />);
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  test('displays filename when provided', () => {
    renderWithChat(<CodeBlock kind="code" code="test" language="ts" filename="utils.ts" />);
    expect(screen.getByText('utils.ts')).toBeInTheDocument();
  });

  test('copy button copies code to clipboard', async () => {
    const user = userEvent.setup();
    const onCodeCopy = vi.fn();

    renderWithChat(<CodeBlock kind="code" code="const x = 1" language="typescript" />, {
      callbacks: { onCodeCopy },
    });

    await user.click(screen.getByLabelText('Copy'));
    expect(onCodeCopy).toHaveBeenCalledWith('const x = 1');
  });

  test('shows apply button when onCodeApply callback is provided', () => {
    renderWithChat(<CodeBlock kind="code" code="test" language="ts" />, {
      callbacks: { onCodeApply: vi.fn() },
    });
    expect(screen.getByLabelText('Apply')).toBeInTheDocument();
  });

  test('hides apply button when no onCodeApply callback', () => {
    renderWithChat(<CodeBlock kind="code" code="test" language="ts" />);
    expect(screen.queryByLabelText('Apply')).not.toBeInTheDocument();
  });

  test('shows open file button when uri is provided with onFileOpen callback', () => {
    renderWithChat(<CodeBlock kind="code" code="test" language="ts" uri="file:///test.ts" />, {
      callbacks: { onFileOpen: vi.fn() },
    });
    expect(screen.getByLabelText('Open File')).toBeInTheDocument();
  });

  test('hides toolbar when showToolbar is false', () => {
    renderWithChat(<CodeBlock kind="code" code="test" language="ts" showToolbar={false} />);
    expect(screen.queryByLabelText('Copy')).not.toBeInTheDocument();
  });

  test('fires onCodeApply when apply is clicked', async () => {
    const user = userEvent.setup();
    const onCodeApply = vi.fn();

    renderWithChat(<CodeBlock kind="code" code="test code" language="ts" uri="file:///a.ts" />, {
      callbacks: { onCodeApply },
    });

    await user.click(screen.getByLabelText('Apply'));
    expect(onCodeApply).toHaveBeenCalledWith('test code', 'ts', 'file:///a.ts');
  });
});
