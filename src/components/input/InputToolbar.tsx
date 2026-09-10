/**
 * InputToolbar — toolbar with mode/model pickers and submit/cancel button.
 *
 * @module components/input/InputToolbar
 */

import { memo, useCallback } from 'react';
import type { ChatMode } from '../../types/models';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';
import { IconButton } from '../atoms/IconButton';

export interface InputToolbarProps {
  /** Current chat mode */
  mode: ChatMode;
  /** Mode change handler */
  onModeChange: (mode: ChatMode) => void;
  /** Current model ID */
  modelId?: string;
  /** Model change handler */
  onModelChange: (modelId: string) => void;
  /** Submit handler */
  onSubmit: () => void;
  /** Cancel handler (when streaming) */
  onCancel: () => void;
  /** Whether a response is streaming */
  isStreaming: boolean;
  /** Whether submit is enabled */
  canSubmit: boolean;
  /** Whether to show attachment add button */
  showAttachButton: boolean;
  /** Attachment add handler */
  onAttachClick?: () => void;
  /** Additional CSS class */
  className?: string;
}

const MODE_LABELS: Record<ChatMode, string> = {
  ask: 'Ask',
  agent: 'Agent',
  edit: 'Edit',
};

export const InputToolbar = memo(function InputToolbar({
  mode,
  onModeChange,
  modelId,
  onModelChange,
  onSubmit,
  onCancel,
  isStreaming,
  canSubmit,
  showAttachButton,
  onAttachClick,
  className,
}: InputToolbarProps) {
  const { config } = useChatContext();

  const handleModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onModeChange(e.target.value as ChatMode);
    },
    [onModeChange],
  );

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onModelChange(e.target.value);
    },
    [onModelChange],
  );

  return (
    <div className={cn('ac-input-toolbar', className)} data-testid="input-toolbar">
      <div className="ac-input-toolbar__left">
        {/* Mode picker */}
        {config.showModePicker && (
          <select
            className="ac-picker"
            value={mode}
            onChange={handleModeChange}
            aria-label="Chat mode"
            data-testid="mode-picker"
          >
            {config.availableModes.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        )}

        {/* Model picker */}
        {config.showModelPicker && config.availableModels.length > 0 && (
          <select
            className="ac-picker"
            value={modelId ?? ''}
            onChange={handleModelChange}
            aria-label="AI model"
            data-testid="model-picker"
          >
            {config.availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        )}

        {/* Attach button */}
        {showAttachButton && (
          <IconButton
            icon="📎"
            label="Attach File"
            onClick={onAttachClick ?? (() => {})}
            size="small"
          />
        )}
      </div>

      <div className="ac-input-toolbar__right">
        {isStreaming ? (
          <button
            className="ac-btn ac-btn--danger ac-submit-btn"
            onClick={onCancel}
            aria-label="Cancel"
            data-testid="cancel-button"
          >
            ■ Stop
          </button>
        ) : (
          <button
            className="ac-btn ac-btn--primary ac-submit-btn"
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-label="Send message"
            data-testid="submit-button"
          >
            ↑ Send
          </button>
        )}
      </div>
    </div>
  );
});
