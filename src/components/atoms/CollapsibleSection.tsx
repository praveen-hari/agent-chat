/**
 * CollapsibleSection — animated expand/collapse panel.
 * Core building block for thinking blocks, references, file lists.
 *
 * @module components/atoms/CollapsibleSection
 */

import { memo, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface CollapsibleSectionProps {
  /** Section header title */
  title: string;
  /** Icon in header */
  icon?: string;
  /** Count badge in header */
  count?: number;
  /** Whether expanded by default */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Expand/collapse change handler */
  onToggle?: (expanded: boolean) => void;
  /** Whether the section is in a "complete" state (shows checkmark) */
  isComplete?: boolean;
  /** Whether the section is actively loading */
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
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? internalExpanded;

  const handleToggle = useCallback(() => {
    const next = !isExpanded;
    setInternalExpanded(next);
    onToggle?.(next);
  }, [isExpanded, onToggle]);

  // Determine status icon
  const statusIconName = isLoading ? 'loading' : isComplete ? 'pass' : undefined;

  return (
    <div
      className={cn('ac-collapsible', isExpanded && 'ac-collapsible--open', className)}
      data-expanded={isExpanded}
    >
      <div
        className="ac-collapsible__header"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${title}${count != null ? `, ${count} items` : ''}`}
      >
        <span className={cn('ac-chevron', isExpanded && 'ac-chevron--open')} aria-hidden="true">
          <Icon name="chevron-right" />
        </span>

        {statusIconName && (
          <span
            className={cn(
              'ac-collapsible__status',
              isComplete && 'ac-collapsible__status--complete',
            )}
            aria-hidden="true"
          >
            <Icon name={statusIconName} spin={isLoading} />
          </span>
        )}

        {icon && (
          <span className="ac-collapsible__icon" aria-hidden="true">
            {/^[a-z]/.test(icon) ? <Icon name={icon} /> : icon}
          </span>
        )}

        <span className="ac-collapsible__title">{title}</span>

        {count != null && <span className="ac-collapsible__count">{count}</span>}

        {subtitle && <span className="ac-collapsible__subtitle">{subtitle}</span>}

        {actions && (
          <span className="ac-collapsible__actions" onClick={(e) => e.stopPropagation()}>
            {actions}
          </span>
        )}
      </div>

      <div className="ac-collapsible__body" role="region" aria-hidden={!isExpanded}>
        {isExpanded && children}
      </div>
    </div>
  );
});
