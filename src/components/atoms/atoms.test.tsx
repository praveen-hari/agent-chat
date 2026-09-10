import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Username } from './Username';
import { ShimmerText } from './ShimmerText';
import { AnimatedDots } from './AnimatedDots';
import { PixelSpinner } from './PixelSpinner';
import { Badge } from './Badge';

describe('Username', () => {
  test('renders name text', () => {
    render(<Username name="Copilot" />);
    expect(screen.getByText('Copilot')).toBeInTheDocument();
  });

  test('renders as span with ac-username class', () => {
    const { container } = render(<Username name="Bot" />);
    expect(container.firstChild).toHaveClass('ac-username');
    expect(container.firstChild?.tagName).toBe('SPAN');
  });

  test('applies compact variant class', () => {
    const { container } = render(<Username name="Bot" variant="compact" />);
    expect(container.firstChild).toHaveClass('ac-username--compact');
  });

  test('applies custom className', () => {
    const { container } = render(<Username name="Bot" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});

describe('ShimmerText', () => {
  test('renders text content when active', () => {
    render(<ShimmerText text="Thinking..." active />);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  test('renders text when inactive', () => {
    render(<ShimmerText text="Done" active={false} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  test('applies inactive class when not active', () => {
    const { container } = render(<ShimmerText text="Done" active={false} />);
    expect(container.firstChild).toHaveClass('ac-shimmer-text--inactive');
  });

  test('applies shimmer class when active', () => {
    const { container } = render(<ShimmerText text="Working" active />);
    expect(container.firstChild).toHaveClass('ac-shimmer-text');
    expect(container.firstChild).not.toHaveClass('ac-shimmer-text--inactive');
  });

  test('partial mode splits first word', () => {
    const { container } = render(<ShimmerText text="Searching files" active mode="partial" />);
    expect(screen.getByText('Searching')).toBeInTheDocument();
    const staticSpan = container.querySelector('.ac-shimmer-text-static');
    expect(staticSpan).not.toBeNull();
    expect(staticSpan!.textContent).toBe(' files');
    const wrapper = container.querySelector('.ac-shimmer-text-wrapper');
    expect(wrapper).not.toBeNull();
  });

  test('partial mode handles single word', () => {
    render(<ShimmerText text="Loading" active mode="partial" />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});

describe('AnimatedDots', () => {
  test('renders 3 dots by default', () => {
    const { container } = render(<AnimatedDots />);
    const dots = container.querySelectorAll('.ac-dot');
    expect(dots).toHaveLength(3);
  });

  test('renders custom count of dots', () => {
    const { container } = render(<AnimatedDots count={5} />);
    const dots = container.querySelectorAll('.ac-dot');
    expect(dots).toHaveLength(5);
  });

  test('has status role with accessible label', () => {
    render(<AnimatedDots label="Agent is typing" />);
    expect(screen.getByRole('status', { name: 'Agent is typing' })).toBeInTheDocument();
  });

  test('default accessible label is Loading', () => {
    render(<AnimatedDots />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });
});

describe('PixelSpinner', () => {
  test('renders with default size', () => {
    const { container } = render(<PixelSpinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass('ac-pixel-spinner');
    expect(spinner).toHaveStyle({ width: '14px', height: '14px' });
  });

  test('applies custom size', () => {
    const { container } = render(<PixelSpinner size={20} />);
    expect(container.firstChild).toHaveStyle({ width: '20px', height: '20px' });
  });

  test('has status role with accessible label', () => {
    render(<PixelSpinner label="Starting servers" />);
    expect(screen.getByRole('status', { name: 'Starting servers' })).toBeInTheDocument();
  });
});

describe('Badge', () => {
  test('renders count', () => {
    render(<Badge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('renders text alternative', () => {
    render(<Badge text="Outdated" variant="warning" />);
    expect(screen.getByText('Outdated')).toBeInTheDocument();
  });

  test('renders nothing when count is 0 and hideZero', () => {
    const { container } = render(<Badge count={0} hideZero />);
    expect(container.firstChild).toBeNull();
  });

  test('renders 0 when hideZero is false', () => {
    render(<Badge count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('applies variant class', () => {
    const { container } = render(<Badge count={1} variant="error" />);
    expect(container.firstChild).toHaveClass('ac-badge--error');
  });

  test('has accessible label for count', () => {
    render(<Badge count={3} />);
    expect(screen.getByLabelText('3 items')).toBeInTheDocument();
  });

  test('has accessible label for text', () => {
    render(<Badge text="New" />);
    expect(screen.getByLabelText('New')).toBeInTheDocument();
  });
});
