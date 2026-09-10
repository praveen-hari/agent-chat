/**
 * RiskBadge — risk level indicator for tool confirmations.
 *
 * @module components/atoms/RiskBadge
 */

import { memo } from 'react';
import type { RiskLevel } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface RiskBadgeProps {
  /** Risk level */
  level: RiskLevel;
  /** Whether to show detail text */
  showText?: boolean;
  /** Additional detail on hover */
  detail?: string;
  /** Additional CSS class */
  className?: string;
}

const RISK_CONFIG: Record<RiskLevel, { codicon: string; label: string }> = {
  assessing: { codicon: 'loading', label: 'Assessing risk…' },
  low: { codicon: 'pass', label: 'Low risk' },
  medium: { codicon: 'warning', label: 'Medium risk' },
  high: { codicon: 'error', label: 'High risk' },
};

export const RiskBadge = memo(function RiskBadge({
  level,
  showText = false,
  detail,
  className,
}: RiskBadgeProps) {
  const config = RISK_CONFIG[level];

  return (
    <span
      className={cn('ac-risk-badge', `ac-risk-badge--${level}`, className)}
      title={detail ?? config.label}
      aria-label={config.label}
    >
      <span className="ac-risk-badge__icon" aria-hidden="true">
        <Icon name={config.codicon} spin={level === 'assessing'} />
      </span>
      {showText && <span className="ac-risk-badge__text">{config.label}</span>}
    </span>
  );
});
