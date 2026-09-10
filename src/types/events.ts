/**
 * Callback interfaces for all user interactions.
 * The library never makes network calls — all actions are delegated to consumers via callbacks.
 *
 * @module types/events
 */

import type { ChatAttachment, ChatFollowup, ChatMode, VoteDirection } from './models';

/**
 * All callback handlers that consumers provide to `<ChatProvider>`.
 * Every callback is optional — the library gracefully degrades
 * when a handler is missing (e.g., vote buttons are hidden if no `onVote`).
 */
export interface ChatCallbacks {
  // ─── Message Flow ───

  /** User sends a new message */
  onSendMessage?: (
    message: string,
    attachments?: ChatAttachment[],
    options?: SendMessageOptions,
  ) => void | Promise<void>;

  /** User cancels an in-progress response */
  onCancelResponse?: (responseId: string) => void;

  /** User retries a failed/cancelled response */
  onRetryResponse?: (responseId: string) => void;

  /** User edits a previous request */
  onEditRequest?: (requestId: string, newMessage: string) => void;

  /** User deletes a request (and its response) */
  onDeleteRequest?: (requestId: string) => void;

  // ─── Tool Actions ───

  /** User approves/denies a tool confirmation */
  onToolAction?: (toolCallId: string, actionId: string, toolId: string) => void;

  /** User responds to an elicitation */
  onElicitationAction?: (partId: string, actionId: string, data?: unknown) => void;

  /** User approves/rejects a plan */
  onPlanAction?: (planId: string, action: 'approve' | 'reject', feedback?: string) => void;

  // ─── Question Carousel ───

  /** User submits answers to a question carousel */
  onQuestionSubmit?: (answers: Record<number, string | string[]>) => void;

  /** User navigates carousel step */
  onQuestionNavigate?: (step: number) => void;

  /** User skips remaining questions */
  onQuestionSkip?: () => void;

  // ─── Feedback ───

  /** User votes on a response */
  onVote?: (responseId: string, direction: VoteDirection) => void;

  // ─── Followups & Actions ───

  /** User clicks a followup suggestion */
  onFollowupClick?: (followup: ChatFollowup) => void;

  /** User clicks a command button */
  onCommandClick?: (commandId: string, args?: unknown[]) => void;

  /** User clicks an inline file/symbol reference */
  onReferenceClick?: (uri: string, range?: { startLine: number; endLine: number }) => void;

  /** User clicks "open file" on an edit pill or code block */
  onFileOpen?: (uri: string) => void;

  /** User clicks "apply" on a code block */
  onCodeApply?: (code: string, language: string, filename?: string) => void;

  /** User clicks "copy" on a code block */
  onCodeCopy?: (code: string) => void;

  // ─── Attachments ───

  /** User adds an attachment */
  onAttachmentAdd?: (attachment: ChatAttachment) => void;

  /** User removes an attachment */
  onAttachmentRemove?: (attachmentId: string) => void;

  // ─── Terminal ───

  /** User clicks "focus terminal" */
  onTerminalFocus?: (command: string) => void;

  /** User clicks "continue in background" */
  onTerminalBackground?: (command: string) => void;

  // ─── External Actions ───

  /** User clicks a PR card */
  onPullRequestClick?: (url: string) => void;

  /** User clicks "upgrade" on quota exceeded */
  onUpgradeClick?: (url: string) => void;

  /** User clicks "sign in" on rate limited */
  onSignInClick?: (url: string) => void;

  /** User dismisses a tip */
  onTipDismiss?: (message: string) => void;

  /** User clicks "open sub-agent" */
  onSubAgentOpen?: (agentName: string) => void;

  /** User clicks a suggest-next prompt */
  onSuggestNextClick?: (message: string) => void;
}

/** Options that can override defaults when sending a message */
export interface SendMessageOptions {
  /** Override the chat mode for this message */
  mode?: ChatMode;
  /** Override the model for this message */
  modelId?: string;
}
