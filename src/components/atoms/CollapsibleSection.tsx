/**
 * Animated expand/collapse panel.
 * Core building block for thinking, references, file lists.
 *
 * @module components/atoms/CollapsibleSection
 */

import { memo, useId } from 'react';
import { useCollapsible } from '../../hooks/useCollapsible';
import { cn } from '../../utils/cn';
import { Badge } from './Badge';
import { StatusIcon } from './StatusIcon';

export interface CollapsibleSectionProps {
  /** Section header title */
  title: string;
  /** Icon in header (emoji) */
  icon?: string;
  /** Count badge in header */
  count?: number;
  /** Whether expanded by default (uncontrolled) */
  defaultExpanded?: boolean;
  /** Controlled expanded state — overrides internal state */
  expanded?: boolean;
  /** Expand/collapse change handler */
  onToggle?: (expanded: boolean) => void;
  /** Whether the section is in a "complete" state (shows checkmark) */
  isComplete?: boolean;
  /** Whether the section is actively loading (shows spinner) */
  isLoading?: boolean;
  /** Subtitle text */
  subtitle?: string;
  /** Header toolbar actions */
  actions?: React.ReactNode;
  /** Children (body content) */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders an animated collapsible panel with header and body.
 *
 * States:
 * - `isLoading` → spinner icon instead of chevron
 * - `isComplete` → checkmark icon
 * - default → rotating chevron
 *
 * @example
 * ```tsx
 * <CollapsibleSection title="Used 5 references" count={5}>
 *   <ReferencesList references={refs} />
 * </CollapsibleSection>
 * ```
 */
export const CollapsibleSection = memo(function CollapsibleSection({
  title,
  icon,
  count,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggle,
  isComplete = false,
  isLoading = false,
  subtitle,
  actions,
  children,
  className,
}: CollapsibleSectionProps) {
  const { isExpanded, toggle } = useCollapsible(defaultExpanded, { onToggle });
  const contentId = useId();
  const buttonId = useId();

  const isExpandedNow = controlledExpanded ?? isExpanded;

  return (
    <div
      className={cn(
        'ac-collapsible',
        isExpandedNow && 'ac-collapsible--open',
        isComplete && 'ac-collapsible--complete',
        isLoading && 'ac-collapsible--loading',
        className,
      )}
    >
      <button
        type="button"
        id={buttonId}
        className="ac-collapsible__header"
        onClick={toggle}
        aria-expanded={isExpandedNow}
        aria-controls={contentId}
      >
        {isLoading ? (
          <StatusIcon status="running" size={14} />
        ) : isComplete ? (
          <StatusIcon status="complete" size={14} />
        ) : (
          <span
            className={cn('ac-chevron', isExpandedNow && 'ac-chevron--open')}
            aria-hidden="true"
          >
            ▶
          </span>
        )}

        {icon && (
          <span className="ac-collapsible__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <span className="ac-collapsible__title">{title}</span>

        {subtitle && <span className="ac-collapsible__subtitle">{subtitle}</span>}

        {count !== undefined && <Badge count={count} />}

        {actions && <span className="ac-collapsible__actions">{actions}</span>}
      </button>

      <div
        id={contentId}
        ref={undefined}
        className="ac-collapsible__body"
        style={{ display: isExpandedNow ? 'block' : 'none' }}
        role="region"
        aria-labelledby={buttonId}
      >
        {children}
      </div>
    </div>
  );
});
