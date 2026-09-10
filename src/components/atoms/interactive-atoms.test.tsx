import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';
import { Chip } from './Chip';
import { RiskBadge } from './RiskBadge';
import { StatusIcon } from './StatusIcon';
import { Timestamp } from './Timestamp';

describe('IconButton', () => {
  test('renders icon with accessible label', () => {
    render(<IconButton icon="📋" label="Copy" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  test('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="📋" label="Copy" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="📋" label="Copy" onClick={onClick} disabled />);
    const btn = screen.getByRole('button', { name: 'Copy' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });

  test('shows label text when showLabel is true', () => {
    render(<IconButton icon="📋" label="Copy" onClick={() => {}} showLabel />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  test('applies variant class', () => {
    const { container } = render(
      <IconButton icon="↑" label="Send" onClick={() => {}} variant="primary" />,
    );
    expect(container.firstChild).toHaveClass('ac-icon-button--primary');
  });

  test('applies small size class', () => {
    const { container } = render(
      <IconButton icon="×" label="Close" onClick={() => {}} size="small" />,
    );
    expect(container.firstChild).toHaveClass('ac-icon-button--small');
  });

  test('shows keybinding in title', () => {
    render(<IconButton icon="↑" label="Send" onClick={() => {}} keybinding="Enter" />);
    expect(screen.getByTitle('Send (Enter)')).toBeInTheDocument();
  });

  test('shows keybinding kbd element when showLabel', () => {
    render(<IconButton icon="↑" label="Send" onClick={() => {}} showLabel keybinding="⌘⏎" />);
    expect(screen.getByText('⌘⏎')).toBeInTheDocument();
  });
});

describe('Chip', () => {
  test('renders label', () => {
    render(<Chip label="src/app.ts" />);
    expect(screen.getByText('src/app.ts')).toBeInTheDocument();
  });

  test('renders icon when provided', () => {
    render(<Chip label="file.ts" icon="📄" />);
    expect(screen.getByText('📄')).toBeInTheDocument();
  });

  test('renders as button when onClick provided', () => {
    render(<Chip label="file.ts" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'file.ts' })).toBeInTheDocument();
  });

  test('renders as span when not clickable', () => {
    const { container } = render(<Chip label="file.ts" />);
    expect(container.firstChild?.tagName).toBe('SPAN');
  });

  test('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Chip label="file.ts" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'file.ts' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('shows remove button when removable', () => {
    render(<Chip label="file.ts" removable onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove file.ts' })).toBeInTheDocument();
  });

  test('fires onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    render(<Chip label="file.ts" removable onRemove={onRemove} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove file.ts' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('applies variant class', () => {
    const { container } = render(<Chip label="file.ts" variant="terminal" />);
    expect(container.firstChild).toHaveClass('ac-chip--terminal');
  });
});

describe('RiskBadge', () => {
  test('renders low risk with check icon', () => {
    const { container } = render(<RiskBadge level="low" />);
    expect(container.firstChild).toHaveClass('ac-risk-badge--low');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('renders medium risk with warning icon', () => {
    render(<RiskBadge level="medium" />);
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  test('renders high risk with error icon', () => {
    render(<RiskBadge level="high" />);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  test('renders text when showText is true', () => {
    render(<RiskBadge level="low" showText />);
    expect(screen.getByText('Low risk')).toBeInTheDocument();
  });

  test('does not render text when showText is false', () => {
    render(<RiskBadge level="low" />);
    expect(screen.queryByText('Low risk')).not.toBeInTheDocument();
  });

  test('assessing level shows spinner status', () => {
    render(<RiskBadge level="assessing" showText />);
    expect(screen.getByText('Assessing risk…')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('shows detail on hover via title', () => {
    render(<RiskBadge level="high" detail="Deletes production data" />);
    expect(screen.getByTitle('Deletes production data')).toBeInTheDocument();
  });
});

describe('StatusIcon', () => {
  test('renders running spinner', () => {
    const { container } = render(<StatusIcon status="running" />);
    expect(container.firstChild).toHaveClass('ac-status-icon--running');
    expect(screen.getByRole('img', { name: 'In progress' })).toBeInTheDocument();
  });

  test('renders complete checkmark', () => {
    render(<StatusIcon status="complete" />);
    expect(screen.getByRole('img', { name: 'Complete' })).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('renders failed icon', () => {
    render(<StatusIcon status="failed" />);
    expect(screen.getByRole('img', { name: 'Failed' })).toBeInTheDocument();
  });

  test('renders each status variant', () => {
    const statuses = ['cancelled', 'pending', 'warning', 'info'] as const;
    for (const status of statuses) {
      const { unmount } = render(<StatusIcon status={status} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      unmount();
    }
  });

  test('applies spinner animation class for running', () => {
    const { container } = render(<StatusIcon status="running" animate />);
    expect(container.querySelector('.ac-spinner')).not.toBeNull();
  });

  test('no spinner animation when animate is false', () => {
    const { container } = render(<StatusIcon status="running" animate={false} />);
    expect(container.querySelector('.ac-spinner')).toBeNull();
  });

  test('applies custom size', () => {
    const { container } = render(<StatusIcon status="complete" size={20} />);
    expect(container.firstChild).toHaveStyle({ width: '20px', height: '20px' });
  });

  test('accepts custom accessible label', () => {
    render(<StatusIcon status="running" label="Searching files" />);
    expect(screen.getByRole('img', { name: 'Searching files' })).toBeInTheDocument();
  });
});

describe('Timestamp', () => {
  test('renders relative time for recent timestamp', () => {
    render(<Timestamp time={Date.now() - 5000} />);
    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  test('renders seconds ago', () => {
    render(<Timestamp time={Date.now() - 30000} />);
    expect(screen.getByText('30s ago')).toBeInTheDocument();
  });

  test('renders minutes ago', () => {
    render(<Timestamp time={Date.now() - 120000} />);
    expect(screen.getByText('2m ago')).toBeInTheDocument();
  });

  test('renders hours ago', () => {
    render(<Timestamp time={Date.now() - 7200000} />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  test('renders absolute format when specified', () => {
    const time = Date.now() - 60000;
    render(<Timestamp time={time} format="absolute" />);
    const el = screen.getByRole('time') as HTMLElement;
    expect(el.textContent).not.toBe('');
  });

  test('shows absolute time tooltip', () => {
    render(<Timestamp time={Date.now() - 30000} />);
    const tooltipTrigger = screen.getByTitle(/2026|2025/);
    expect(tooltipTrigger).toBeInTheDocument();
  });

  test('renders as time element with dateTime attribute', () => {
    const time = Date.now() - 60000;
    const { container } = render(<Timestamp time={time} />);
    expect(container.firstChild?.tagName).toBe('TIME');
    expect(container.firstChild).toHaveAttribute('datetime');
  });
});
