/**
 * AttachmentsRow — displays user-attached files/images/tools as a row of chips.
 *
 * @module components/messages/AttachmentsRow
 */

import { memo, useCallback } from 'react';
import type { ChatAttachment } from '../../types/models';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';
import { Chip } from '../atoms/Chip';

export interface AttachmentsRowProps {
  /** Attachment list */
  attachments: ChatAttachment[];
  /** Whether attachments are removable (input mode) */
  editable?: boolean;
  /** Remove handler (for input mode) */
  onRemove?: (id: string) => void;
  /** Additional CSS class */
  className?: string;
}

export const AttachmentsRow = memo(function AttachmentsRow({
  attachments,
  editable = false,
  onRemove,
  className,
}: AttachmentsRowProps) {
  const { config, callbacks } = useChatContext();

  const handleFileOpen = useCallback(
    (uri: string) => {
      callbacks.onFileOpen?.(uri);
    },
    [callbacks],
  );

  return (
    <div className={cn('ac-attachments-row', className)} data-testid="attachments-row">
      {attachments.map((att) => {
        // Check for consumer override
        const Override = config.attachmentOverrides?.[att.type];
        if (Override) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const OverrideComponent = Override as React.ComponentType<any>;
          return <OverrideComponent key={att.id} {...att} />;
        }

        switch (att.type) {
          case 'file':
            return (
              <Chip
                key={att.id}
                icon="📄"
                label={att.filename}
                onClick={() => handleFileOpen(att.uri)}
                removable={editable}
                onRemove={() => onRemove?.(att.id)}
              />
            );
          case 'image':
            return (
              <Chip
                key={att.id}
                icon="🖼"
                label={att.filename}
                removable={editable}
                onRemove={() => onRemove?.(att.id)}
              />
            );
          case 'terminal':
            return <Chip key={att.id} icon="💻" label={att.label} />;
          case 'toolset':
            return <Chip key={att.id} icon={att.icon ?? '🔧'} label={att.name} />;
          case 'selection':
            return (
              <Chip
                key={att.id}
                icon="📝"
                label={`${att.filename}:${att.range.startLine}-${att.range.endLine}`}
              />
            );
          case 'custom':
            return <Chip key={att.id} icon={att.icon ?? '📎'} label={att.label} />;
          default:
            return null;
        }
      })}
    </div>
  );
});
