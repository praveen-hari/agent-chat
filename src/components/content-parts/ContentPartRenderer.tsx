/**
 * ContentPartRenderer — central dispatcher that maps `ChatContentPart.kind`
 * to the correct React component.
 *
 * Checks for consumer-provided overrides first (via config.contentPartOverrides),
 * then falls back to built-in components.
 *
 * @module components/content-parts/ContentPartRenderer
 */

import { memo } from 'react';
import type { ChatContentPart } from '../../types/content-parts';
import type { ChatResponse } from '../../types/models';
import { useChatContext } from '../../provider/useChatContext';
import { MarkdownContent } from './MarkdownContent';
import { CodeBlock } from './CodeBlock';
import { ThinkingBlock } from './ThinkingBlock';
import { SubAgentDisplay } from './SubAgentDisplay';
import { ProgressStep } from './ProgressStep';
import { WorkingIndicator } from './WorkingIndicator';
import { EditPill } from './EditPill';
import { FileChangesSummary } from './FileChangesSummary';
import { TurnPills } from './TurnPills';
import { InlineDiff } from './InlineDiff';
import { WorkspaceEdit } from './WorkspaceEdit';
import { TodoList } from './TodoList';
import { PlanReviewCard } from './PlanReviewCard';
import { FileTree } from './FileTree';
import { ReferencesList } from './ReferencesList';
import { InlineReference } from './InlineReference';
import { ImageContent } from './ImageContent';
import { ErrorMessage } from '../notifications/ErrorMessage';
import { SystemNotification } from '../notifications/SystemNotification';
import { WorkspaceTransition } from '../notifications/WorkspaceTransition';
import { HookResult } from '../notifications/HookResult';
import { TipContent } from '../notifications/TipContent';
import { QuotaExceeded } from '../notifications/QuotaExceeded';
import { RateLimited } from '../notifications/RateLimited';
import { ConfirmationDialog } from '../interactive/ConfirmationDialog';
import { ElicitationDialog } from '../interactive/ElicitationDialog';
import { CommandButton } from '../interactive/CommandButton';
import { FollowupButton } from '../interactive/FollowupButton';
import { SuggestNext } from '../interactive/SuggestNext';
import { PullRequestCard } from '../interactive/PullRequestCard';

export interface ContentPartRendererProps {
  /** The content part to render */
  part: ChatContentPart;
  /** Index of this part in the content array */
  index: number;
  /** Whether the parent response is still streaming */
  isStreaming: boolean;
  /** The parent response (for context) */
  response: ChatResponse;
  /** Whether this is the last part */
  isLast: boolean;
}

/** Fallback for unknown part kinds in development */
function UnknownPart({ kind }: { kind: string }) {
  return (
    <div className="ac-notification ac-notification--warning" role="alert">
      <span className="ac-notification__icon" aria-hidden="true">
        ⚠
      </span>
      <span className="ac-notification__message">Unknown content part: {kind}</span>
    </div>
  );
}

export const ContentPartRenderer = memo(function ContentPartRenderer({
  part,
  index: _index,
  isStreaming,
  response: _response,
  isLast,
}: ContentPartRendererProps) {
  const { config } = useChatContext();

  // Check for consumer-provided overrides
  const Override = config.contentPartOverrides?.[part.kind];
  if (Override) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const OverrideComponent = Override as React.ComponentType<any>;
    return <OverrideComponent {...part} />;
  }

  // Default dispatcher
  switch (part.kind) {
    // Text & Markdown
    case 'markdown':
      return <MarkdownContent {...part} isStreaming={isStreaming && isLast} />;
    case 'code':
      return <CodeBlock {...part} />;

    // Thinking & Reasoning
    case 'thinking':
      return <ThinkingBlock {...part} isStreaming={isStreaming} />;
    case 'sub-agent':
      return <SubAgentDisplay {...part} isStreaming={isStreaming} />;

    // Tool Invocations — Phase 6 (rendered as progress steps for now)
    case 'tool-call':
      return (
        <ProgressStep
          kind="progress"
          message={part.label ?? part.toolId}
          isActive={part.status === 'running' || part.status === 'streaming'}
        />
      );
    case 'tool-confirmation':
      return (
        <ConfirmationDialog
          kind="confirmation"
          title={part.title}
          message={part.message}
          subtitle={part.subtitle}
          buttons={part.actions.map((a) => ({ id: a.id, label: a.label, primary: a.primary }))}
        />
      );
    case 'terminal-command':
      return (
        <ProgressStep kind="progress" message={`$ ${part.command}`} isActive={part.isRunning} />
      );

    // File Changes & Diffs
    case 'edit-pill':
      return <EditPill {...part} />;
    case 'file-changes-summary':
      return <FileChangesSummary {...part} />;
    case 'turn-pills':
      return <TurnPills {...part} />;
    case 'inline-diff':
      return <InlineDiff {...part} />;
    case 'workspace-edit':
      return <WorkspaceEdit {...part} />;

    // Progress & Status
    case 'progress':
      return <ProgressStep {...part} />;
    case 'working':
      return <WorkingIndicator {...part} />;
    case 'auto-mode-resolution':
      return (
        <ProgressStep
          kind="progress"
          message={`Using ${part.modelName}`}
          isActive={part.isResolving}
        />
      );
    case 'mcp-servers-starting':
      return (
        <ProgressStep
          kind="progress"
          message={`Starting MCP servers: ${part.servers.join(', ')}`}
          isActive
        />
      );

    // Plan & Todo
    case 'plan-review':
      return <PlanReviewCard {...part} />;
    case 'todo-list':
      return <TodoList {...part} />;

    // Interactive
    case 'confirmation':
      return <ConfirmationDialog {...part} />;
    case 'elicitation':
      return <ElicitationDialog {...part} />;
    case 'question-carousel':
      // Simplified rendering — full carousel in Phase 9
      return (
        <ConfirmationDialog
          kind="confirmation"
          title="Questions"
          message={part.questions.map((q) => q.label).join('\n\n')}
          buttons={[
            { id: 'submit', label: 'Submit', primary: true },
            { id: 'skip', label: 'Skip' },
          ]}
        />
      );

    // References & Links
    case 'references':
      return <ReferencesList {...part} />;
    case 'inline-reference':
      return <InlineReference {...part} />;
    case 'file-tree':
      return <FileTree {...part} />;

    // Notifications
    case 'error':
      return <ErrorMessage {...part} />;
    case 'system-notification':
      return <SystemNotification {...part} />;
    case 'workspace-transition':
      return <WorkspaceTransition {...part} />;
    case 'hook-result':
      return <HookResult {...part} />;
    case 'tip':
      return <TipContent {...part} />;
    case 'quota-exceeded':
      return <QuotaExceeded {...part} />;
    case 'rate-limited':
      return <RateLimited {...part} />;

    // Rich Content
    case 'pull-request':
      return <PullRequestCard {...part} />;
    case 'image':
      return <ImageContent {...part} />;
    case 'extensions':
      return (
        <ProgressStep
          kind="progress"
          message={`${part.extensions.length} extension(s)`}
          isActive={part.isLoading ?? false}
        />
      );
    case 'mcp-auth-required':
      return (
        <ErrorMessage
          kind="error"
          message={`Authentication required for: ${part.servers.map((s) => s.name).join(', ')}`}
          level="warning"
        />
      );

    // Actions
    case 'command':
      return <CommandButton {...part} />;
    case 'suggest-next':
      return <SuggestNext {...part} />;
    case 'followup':
      return <FollowupButton followup={part} />;

    // Collapsible markdown
    case 'collapsible-markdown':
      return <MarkdownContent kind="markdown" content={part.content} isStreaming={false} />;

    // Code citation
    case 'code-citation':
      return <CodeBlock kind="code" code={part.code} language="text" />;

    // Tool confirmation carousel — render first tool
    case 'tool-confirmation-carousel': {
      const tool = part.tools[part.currentIndex ?? 0];
      if (tool) {
        return (
          <ConfirmationDialog
            kind="confirmation"
            title={tool.title}
            message={tool.message}
            subtitle={tool.subtitle}
            buttons={tool.actions.map((a) => ({ id: a.id, label: a.label, primary: a.primary }))}
          />
        );
      }
      return null;
    }

    default:
      return <UnknownPart kind={(part as { kind: string }).kind} />;
  }
});
