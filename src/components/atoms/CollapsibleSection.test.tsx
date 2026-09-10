import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsibleSection } from './CollapsibleSection';

describe('CollapsibleSection', () => {
  test('renders title in header', () => {
    render(
      <CollapsibleSection title="Used 5 references">
        <span>Content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByRole('button', { name: /Used 5 references/ })).toBeInTheDocument();
  });

  test('body is hidden by default', () => {
    render(
      <CollapsibleSection title="Section">
        <span data-testid="body-content">Content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByTestId('body-content')).not.toBeVisible();
  });

  test('body shows when defaultExpanded is true', () => {
    render(
      <CollapsibleSection title="Section" defaultExpanded>
        <span data-testid="body-content">Content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByTestId('body-content')).toBeVisible();
  });

  test('clicking header toggles expansion', async () => {
    render(
      <CollapsibleSection title="Section">
        <span data-testid="body-content">Content</span>
      </CollapsibleSection>,
    );

    const header = screen.getByRole('button', { name: /Section/ });
    expect(screen.getByTestId('body-content')).not.toBeVisible();

    await userEvent.click(header);
    expect(screen.getByTestId('body-content')).toBeVisible();

    await userEvent.click(header);
    expect(screen.getByTestId('body-content')).not.toBeVisible();
  });

  test('fires onToggle with new state', async () => {
    const onToggle = vi.fn();
    render(
      <CollapsibleSection title="Section" onToggle={onToggle}>
        <span>Content</span>
      </CollapsibleSection>,
    );

    await userEvent.click(screen.getByRole('button', { name: /Section/ }));
    expect(onToggle).toHaveBeenCalledWith(true);

    await userEvent.click(screen.getByRole('button', { name: /Section/ }));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  test('shows count badge when count provided', () => {
    render(
      <CollapsibleSection title="Section" count={5}>
        <span>Content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('shows icon in header when provided', () => {
    render(
      <CollapsibleSection title="Section" icon="📂">
        <span>Content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('📂')).toBeInTheDocument();
  });

  test('shows subtitle when provided', () => {
    render(
      <CollapsibleSection title="Section" subtitle="+5 -2">
        <span>Content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByText('+5 -2')).toBeInTheDocument();
  });

  test('header has aria-expanded reflecting state', async () => {
    render(
      <CollapsibleSection title="Section">
        <span>Content</span>
      </CollapsibleSection>,
    );
    const header = screen.getByRole('button', { name: /Section/ });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  test('body has region role with aria-labelledby', () => {
    const { container } = render(
      <CollapsibleSection title="Section">
        <span>Content</span>
      </CollapsibleSection>,
    );
    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('aria-labelledby');
  });

  test('shows loading spinner state', () => {
    const { container } = render(
      <CollapsibleSection title="Section" isLoading>
        <span>Content</span>
      </CollapsibleSection>,
    );
    expect(container.firstChild).toHaveClass('ac-collapsible--loading');
    expect(screen.getByRole('img', { name: 'In progress' })).toBeInTheDocument();
  });

  test('shows complete checkmark state', () => {
    const { container } = render(
      <CollapsibleSection title="Section" isComplete>
        <span>Content</span>
      </CollapsibleSection>,
    );
    expect(container.firstChild).toHaveClass('ac-collapsible--complete');
    expect(screen.getByRole('img', { name: 'Complete' })).toBeInTheDocument();
  });

  test('controlled expanded prop overrides internal state', () => {
    render(
      <CollapsibleSection title="Section" expanded>
        <span data-testid="body-content">Content</span>
      </CollapsibleSection>,
    );
    expect(screen.getByTestId('body-content')).toBeVisible();
  });
});
