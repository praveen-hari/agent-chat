/**
 * Configuration options for the AgentChat component.
 *
 * @module types/config
 */

import type { ComponentType } from 'react';
import type { ChatContentPart } from './content-parts';
import type { ChatAttachment, ChatMode } from './models';

/**
 * Configuration options for `<AgentChat>`.
 * Controls layout, features, and behavior.
 */
export interface AgentChatConfig {
  // ─── Layout ───

  /** Maximum width of the chat container in pixels (default: 950) */
  maxWidth?: number;

  /** Whether to show the welcome screen when empty (default: true) */
  showWelcome?: boolean;

  /** Welcome screen title */
  welcomeTitle?: string;

  /** Welcome screen suggestions */
  welcomeSuggestions?: Array<{ label: string; message: string; icon?: string }>;

  // ─── Input ───

  /** Placeholder text for the input area */
  placeholder?: string;

  /** Maximum input height in pixels (default: 250) */
  maxInputHeight?: number;

  /** Whether to show the mode picker (default: true) */
  showModePicker?: boolean;

  /** Whether to show the model picker (default: true) */
  showModelPicker?: boolean;

  /** Available chat modes */
  availableModes?: ChatMode[];

  /** Available model options */
  availableModels?: ModelOption[];

  /** Whether to enable file attachment (default: true) */
  enableAttachments?: boolean;

  // ─── Rendering ───

  /** Whether to enable streaming word animation (default: true) */
  enableStreamingAnimation?: boolean;

  /** Words per second for progressive rendering (default: 80) */
  streamingWordsPerSecond?: number;

  /** Whether to enable syntax highlighting in code blocks (default: true) */
  enableSyntaxHighlighting?: boolean;

  /** Whether to enable KaTeX math rendering (default: true) */
  enableMath?: boolean;

  /** Whether to virtualize the message list (default: true for >50 messages) */
  enableVirtualization?: boolean;

  // ─── Features ───

  /** Whether to show vote buttons (requires onVote callback) */
  showVoteButtons?: boolean;

  /** Whether to show copy button on responses */
  showCopyButton?: boolean;

  /** Whether to show response timing details */
  showResponseDetails?: boolean;

  /** Whether to show token usage */
  showTokenUsage?: boolean;

  /** Whether to show the dockable todo list widget */
  showTodoList?: boolean;

  // ─── Accessibility ───

  /** Accessible label for the chat widget */
  ariaLabel?: string;

  /** Whether to announce new messages to screen readers */
  announceMessages?: boolean;

  // ─── Customization ───

  /** Custom content part renderer overrides */
  contentPartOverrides?: Partial<ContentPartRendererMap>;

  /** Custom attachment renderer overrides */
  attachmentOverrides?: Partial<AttachmentRendererMap>;
}

/** Model option for the model picker dropdown */
export interface ModelOption {
  /** Unique model identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: string;
}

/**
 * Map from content part `kind` to a custom React component.
 * Consumers can override rendering of specific content parts.
 */
export type ContentPartRendererMap = {
  [K in ChatContentPart['kind']]: ComponentType<Extract<ChatContentPart, { kind: K }>>;
};

/**
 * Map from attachment `type` to a custom React component.
 * Consumers can override rendering of specific attachment types.
 */
export type AttachmentRendererMap = {
  [K in ChatAttachment['type']]: ComponentType<Extract<ChatAttachment, { type: K }>>;
};
