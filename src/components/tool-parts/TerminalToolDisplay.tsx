/**
 * TerminalToolDisplay — embedded terminal output for shell command tools.
 * Shows command, output, exit code, and focus/background actions.
 *
 * @module components/tool-parts/TerminalToolDisplay
 */

import { memo, useState, useCallback } from 'react';
import type { TerminalCommandPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { truncate } from './toolUtils';
import { Icon } from '../atoms/Icon';
import { PixelSpinner } from '../atoms/PixelSpinner';
import { IconButton } from '../atoms/IconButton';
import { useChatContext } from '../../provider/useChatContext';

export interface TerminalToolDisplayProps extends TerminalCommandPart {
  /** Additional CSS class */
  className?: string;
}

/** Exit code badge component */
function ExitCodeBadge({ code }: { code: number | null }) {
  if (code === null) return null;

  const isSuccess = code === 0;
  return (
    <span
      className={cn(
        'ac-terminal-tool__exit-code',
        isSuccess ? 'ac-terminal-tool__exit-code--success' : 'ac-terminal-tool__exit-code--error',
      )}
      aria-label={`Exit code ${code}`}
    >
      <Icon name={isSuccess ? 'pass' : 'error'} size={12} /> {code}
    </span>
  );
}

export const TerminalToolDisplay = memo(function TerminalToolDisplay({
  command,
  output,
  exitCode,
  isRunning,
  visibleRows = 5,
  cwd,
  className,
}: TerminalToolDisplayProps) {
  const { callbacks } = useChatContext();
  const [expanded, setExpanded] = useState(false);

  const handleFocusTerminal = useCallback(() => {
    callbacks.onTerminalFocus?.(command);
  }, [command, callbacks]);

  const handleBackground = useCallback(() => {
    callbacks.onTerminalBackground?.(command);
  }, [command, callbacks]);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const maxHeight = expanded ? 'none' : `${visibleRows * 20}px`;

  return (
    <div className={cn('ac-terminal-tool', className)} data-testid="terminal-tool-display">
      <div className="ac-terminal-tool__header">
        <span className="ac-terminal-tool__icon" aria-hidden="true">
          <Icon name="terminal" />
        </span>
        <span className="ac-terminal-tool__command" title={command}>
          <span className="ac-terminal-tool__prompt">$</span> {truncate(command, 60)}
        </span>
        {cwd && (
          <span className="ac-terminal-tool__cwd" title={cwd}>
            in {truncate(cwd, 30)}
          </span>
        )}
        <div className="ac-terminal-tool__actions">
          {isRunning ? <PixelSpinner label="Running" /> : <ExitCodeBadge code={exitCode} />}
          <IconButton icon="💻" label="Focus Terminal" onClick={handleFocusTerminal} size="small" />
          {isRunning && (
            <IconButton
              icon="debug-continue"
              label="Continue in Background"
              onClick={handleBackground}
              size="small"
            />
          )}
          {output && (
            <IconButton
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              label={expanded ? 'Collapse Output' : 'Expand Output'}
              onClick={toggleExpand}
              size="small"
            />
          )}
        </div>
      </div>

      {output && (
        <div className="ac-terminal-tool__output" style={{ maxHeight }}>
          <pre className="ac-terminal-tool__pre">
            <code>{output}</code>
          </pre>
        </div>
      )}
    </div>
  );
});
