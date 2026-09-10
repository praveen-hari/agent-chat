/**
 * Hook providing action dispatch methods with built-in guards.
 * Actions are no-ops when the corresponding callback is not provided.
 *
 * @module provider/useChatActions
 */

import { useMemo } from 'react';
import { useChatContext } from './useChatContext';
import type { ChatAttachment, ChatFollowup, VoteDirection } from '../types/models';
import type { SendMessageOptions } from '../types/events';

/**
 * Returns an object of action methods that safely delegate to consumer callbacks.
 * Missing callbacks become no-ops. Also exposes computed `canSend` and `canCancel`.
 *
 * @example
 * ```tsx
 * const actions = useChatActions();
 * actions.sendMessage('hello');
 * actions.vote('resp-1', 'up');
 * if (actions.canCancel) actions.cancelResponse();
 * ```
 */
export function useChatActions() {
  const { callbacks, isStreaming, streamingResponse } = useChatContext();

  return useMemo(
    () => ({
      // ─── Message Flow ───

      sendMessage: (
        message: string,
        attachments?: ChatAttachment[],
        options?: SendMessageOptions,
      ) => {
        callbacks.onSendMessage?.(message, attachments, options);
      },

      cancelResponse: (responseId?: string) => {
        const id = responseId ?? streamingResponse?.id;
        if (id) callbacks.onCancelResponse?.(id);
      },

      retryResponse: (responseId: string) => {
        callbacks.onRetryResponse?.(responseId);
      },

      editRequest: (requestId: string, newMessage: string) => {
        callbacks.onEditRequest?.(requestId, newMessage);
      },

      deleteRequest: (requestId: string) => {
        callbacks.onDeleteRequest?.(requestId);
      },

      // ─── Tool Actions ───

      toolAction: (toolCallId: string, actionId: string, toolId: string) => {
        callbacks.onToolAction?.(toolCallId, actionId, toolId);
      },

      elicitationAction: (partId: string, actionId: string, data?: unknown) => {
        callbacks.onElicitationAction?.(partId, actionId, data);
      },

      planAction: (planId: string, action: 'approve' | 'reject', feedback?: string) => {
        callbacks.onPlanAction?.(planId, action, feedback);
      },

      // ─── Feedback ───

      vote: (responseId: string, direction: VoteDirection) => {
        callbacks.onVote?.(responseId, direction);
      },

      // ─── Followups & Actions ───

      followupClick: (followup: ChatFollowup) => {
        callbacks.onFollowupClick?.(followup);
      },

      commandClick: (commandId: string, args?: unknown[]) => {
        callbacks.onCommandClick?.(commandId, args);
      },

      referenceClick: (uri: string, range?: { startLine: number; endLine: number }) => {
        callbacks.onReferenceClick?.(uri, range);
      },

      fileOpen: (uri: string) => {
        callbacks.onFileOpen?.(uri);
      },

      codeApply: (code: string, language: string, filename?: string) => {
        callbacks.onCodeApply?.(code, language, filename);
      },

      codeCopy: (code: string) => {
        callbacks.onCodeCopy?.(code);
      },

      // ─── Attachments ───

      attachmentAdd: (attachment: ChatAttachment) => {
        callbacks.onAttachmentAdd?.(attachment);
      },

      attachmentRemove: (attachmentId: string) => {
        callbacks.onAttachmentRemove?.(attachmentId);
      },

      // ─── Terminal ───

      terminalFocus: (command: string) => {
        callbacks.onTerminalFocus?.(command);
      },

      terminalBackground: (command: string) => {
        callbacks.onTerminalBackground?.(command);
      },

      // ─── External Actions ───

      pullRequestClick: (url: string) => {
        callbacks.onPullRequestClick?.(url);
      },

      upgradeClick: (url: string) => {
        callbacks.onUpgradeClick?.(url);
      },

      signInClick: (url: string) => {
        callbacks.onSignInClick?.(url);
      },

      tipDismiss: (message: string) => {
        callbacks.onTipDismiss?.(message);
      },

      subAgentOpen: (agentName: string) => {
        callbacks.onSubAgentOpen?.(agentName);
      },

      suggestNextClick: (message: string) => {
        callbacks.onSuggestNextClick?.(message);
      },

      // ─── Computed State ───

      /** Whether sending is possible (has handler, not currently streaming) */
      canSend: !isStreaming && !!callbacks.onSendMessage,

      /** Whether cancellation is possible */
      canCancel: isStreaming && !!callbacks.onCancelResponse,
    }),
    [callbacks, isStreaming, streamingResponse],
  );
}
