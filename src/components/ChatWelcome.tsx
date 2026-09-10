/**
 * ChatWelcome — empty state shown when there are no messages.
 * Displays agent icon/logo, title, subtitle, and suggestion prompts.
 *
 * @module components/ChatWelcome
 */

import { memo } from 'react';
import { cn } from '../utils/cn';
import { useChatContext } from '../provider/useChatContext';
import { useChatActions } from '../provider/useChatActions';
import { Avatar } from './atoms/Avatar';

export interface ChatWelcomeProps {
  /** Title text */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Suggestion prompts */
  suggestions?: Array<{ label: string; message: string; icon?: string }>;
  /** Additional CSS class */
  className?: string;
}

export const ChatWelcome = memo(function ChatWelcome({
  title,
  subtitle,
  suggestions,
  className,
}: ChatWelcomeProps) {
  const { activeAgent } = useChatContext();
  const actions = useChatActions();

  return (
    <div className={cn('ac-welcome', className)} data-testid="chat-welcome">
      <div className="ac-welcome__content">
        {/* Agent icon */}
        <div className="ac-welcome__icon">
          {activeAgent ? (
            <Avatar
              icon={activeAgent.icon ?? { iconId: 'copilot' }}
              name={activeAgent.name}
              size={48}
            />
          ) : (
            <span className="ac-welcome__default-icon" aria-hidden="true">
              💬
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="ac-welcome__title">{title ?? 'How can I help you?'}</h2>

        {/* Subtitle */}
        {subtitle && <p className="ac-welcome__subtitle">{subtitle}</p>}

        {/* Suggestion buttons */}
        {suggestions && suggestions.length > 0 && (
          <div className="ac-welcome__suggestions" role="group" aria-label="Suggestions">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="ac-welcome__suggestion"
                onClick={() => actions.sendMessage(s.message)}
              >
                {s.icon && (
                  <span className="ac-welcome__suggestion-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                )}
                <span className="ac-welcome__suggestion-label">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
