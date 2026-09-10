/**
 * Tests for CollapsibleSection component.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsibleSection } from './CollapsibleSection';

describe('CollapsibleSection', () => {
  test('renders title', () => {
    render(
      <CollapsibleSection title="References">
        <span>content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('References')).toBeInTheDocument();
  });

  test('collapsed by default', () => {
    render(
      <CollapsibleSection title="Details">
        <span>hidden content</span>
      </CollapsibleSection>,
    );
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });

  test('expanded by default when defaultExpanded', () => {
    render(
      <CollapsibleSection title="Details" defaultExpanded>
        <span>visible content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('visible content')).toBeInTheDocument();
  });

  test('toggles on click', async () => {
    render(
      <CollapsibleSection title="Toggle Me">
        <span>toggle content</span>
      </CollapsibleSection>,
    );

    expect(screen.queryByText('toggle content')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /toggle me/i }));
    expect(screen.getByText('toggle content')).toBeInTheDocument();
  });

  test('fires onToggle callback', async () => {
    const onToggle = vi.fn();
    render(
      <CollapsibleSection title="Callback" onToggle={onToggle}>
        <span>content</span>
      </CollapsibleSection>,
    );

    await userEvent.click(screen.getByRole('button', { name: /callback/i }));
    expect(onToggle).toHaveBeenCalledWith(true);

    await userEvent.click(screen.getByRole('button', { name: /callback/i }));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  test('toggles on Enter key', async () => {
    render(
      <CollapsibleSection title="Keyboard">
        <span>keyboard content</span>
      </CollapsibleSection>,
    );

    const header = screen.getByRole('button', { name: /keyboard/i });
    header.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('keyboard content')).toBeInTheDocument();
  });

  test('shows count badge', () => {
    render(
      <CollapsibleSection title="Files" count={5}>
        <span>content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('shows icon', () => {
    render(
      <CollapsibleSection title="Search" icon="🔍">
        <span>content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  test('shows subtitle', () => {
    render(
      <CollapsibleSection title="Thinking" subtitle="+12 -3 lines">
        <span>content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('+12 -3 lines')).toBeInTheDocument();
  });

  test('has aria-expanded attribute', async () => {
    render(
      <CollapsibleSection title="ARIA">
        <span>content</span>
      </CollapsibleSection>,
    );

    const header = screen.getByRole('button', { name: /aria/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  test('shows complete status icon', () => {
    render(
      <CollapsibleSection title="Done" isComplete>
        <span>content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('shows loading status icon', () => {
    render(
      <CollapsibleSection title="Loading" isLoading>
        <span>content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('⟳')).toBeInTheDocument();
  });

  test('renders actions in header', () => {
    render(
      <CollapsibleSection title="With Actions" actions={<button>Action</button>}>
        <span>content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('controlled expanded state', () => {
    const { rerender } = render(
      <CollapsibleSection title="Controlled" expanded={false}>
        <span>controlled content</span>
      </CollapsibleSection>,
    );

    expect(screen.queryByText('controlled content')).not.toBeInTheDocument();

    rerender(
      <CollapsibleSection title="Controlled" expanded={true}>
        <span>controlled content</span>
      </CollapsibleSection>,
    );

    expect(screen.getByText('controlled content')).toBeInTheDocument();
  });
});
