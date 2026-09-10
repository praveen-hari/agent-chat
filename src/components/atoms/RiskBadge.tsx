/**
 * Risk level indicator for tool confirmations.
 *
 * @module components/atoms/RiskBadge
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';
import type { RiskLevel } from '../../types/content-parts';
import { PixelSpinner } from './PixelSpinner';

export interface RiskBadgeProps {
  /** Risk level */
  level: RiskLevel;
  /** Whether to show detail text (e.g., "Low risk") */
  showText?: boolean;
  /** Additional detail shown on hover */
  detail?: string;
  /** Additional CSS class */
  className?: string;
}

/** Mapping of risk level to icon and display text */
const RISK_MAP: Record<Exclude<RiskLevel, 'assessing'>, { icon: string; text: string }> = {
  low: { icon: '✓', text: 'Low risk' },
  medium: { icon: '⚠', text: 'Medium risk' },
  high: { icon: '✕', text: 'High risk' },
};

/**
 * Renders a risk level badge with color coding:
 * - `assessing` → spinner + "Assessing risk..."
 * - `low` → green check
 * - `medium` → orange warning
 * - `high` → red error
 *
 * @example
 * ```tsx
 * <RiskBadge level="low" showText />
 * <RiskBadge level="assessing" />
 * <RiskBadge level="high" showText detail="Deletes production data" />
 * ```
 */
export const RiskBadge = memo(function RiskBadge({
  level,
  showText = false,
  detail,
  className,
}: RiskBadgeProps) {
  const baseProps = {
    className: cn('ac-risk-badge', `ac-risk-badge--${level}`, className),
    'aria-label': detail ?? `${level} risk`,
  };

  if (level === 'assessing') {
    return (
      <span {...baseProps}>
        <PixelSpinner size={12} label="Assessing risk" />
        {showText && <span>Assessing risk…</span>}
      </span>
    );
  }

  const { icon, text } = RISK_MAP[level];

  return (
    <span {...baseProps} title={detail} role="img">
      <span className="ac-risk-badge__icon" aria-hidden="true">
        {icon}
      </span>
      {showText && <span className="ac-risk-badge__text">{text}</span>}
    </span>
  );
});
