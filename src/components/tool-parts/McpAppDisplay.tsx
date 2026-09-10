/**
 * McpAppDisplay — embedded display for MCP app tool results.
 * Renders custom HTML in a sandboxed iframe with optional resource links.
 *
 * @module components/tool-parts/McpAppDisplay
 */

import { memo, useCallback } from 'react';
import type { ToolCallStatus, McpResource } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { StatusIcon } from '../atoms/StatusIcon';
import { PixelSpinner } from '../atoms/PixelSpinner';
import { Chip } from '../atoms/Chip';

export interface McpAppDisplayProps {
  /** Tool identifier */
  toolId: string;
  /** Tool call identifier */
  toolCallId: string;
  /** MCP app data */
  mcpApp: { html: string; resources?: McpResource[] };
  /** Current tool status */
  status: ToolCallStatus;
  /** Additional CSS class */
  className?: string;
}

export const McpAppDisplay = memo(function McpAppDisplay({
  toolId,
  mcpApp,
  status,
  className,
}: McpAppDisplayProps) {
  const handleResourceClick = useCallback((resource: McpResource) => {
    if (resource.uri) {
      window.open(resource.uri, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const isLoading = status === 'running' && !mcpApp.html;
  const showFrame = Boolean(mcpApp.html);

  return (
    <div className={cn('ac-mcp-app', className)} data-testid="mcp-app-display">
      <div className="ac-mcp-app__header">
        <span className="ac-mcp-app__title">{toolId}</span>
        <StatusIcon status={status === 'running' ? 'running' : 'complete'} size={14} />
      </div>

      {isLoading && (
        <div className="ac-mcp-app__loading">
          <PixelSpinner label="Loading MCP app" />
          <span>Loading…</span>
        </div>
      )}

      {showFrame && (
        <iframe
          className="ac-mcp-app__frame"
          srcDoc={mcpApp.html}
          sandbox="allow-scripts"
          title={`MCP app: ${toolId}`}
          style={{ minHeight: '100px', maxHeight: '75vh' }}
        />
      )}

      {mcpApp.resources && mcpApp.resources.length > 0 && (
        <div className="ac-mcp-app__resources">
          {mcpApp.resources.map((r) => (
            <Chip key={r.uri} label={r.name} icon="📎" onClick={() => handleResourceClick(r)} />
          ))}
        </div>
      )}
    </div>
  );
});
