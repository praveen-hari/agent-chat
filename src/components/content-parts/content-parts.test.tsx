/**
 * Tests for smaller content part components:
 * ProgressStep, WorkingIndicator, EditPill, FileChangesSummary,
 * TodoList, InlineDiff, ImageContent, SubAgentDisplay, FileTree,
 * ReferencesList, InlineReference, TurnPills, WorkspaceEdit, PlanReviewCard.
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../../test-utils/render';
import { ProgressStep } from './ProgressStep';
import { WorkingIndicator } from './WorkingIndicator';
import { EditPill } from './EditPill';
import { FileChangesSummary } from './FileChangesSummary';
import { TodoList } from './TodoList';
import { InlineDiff } from './InlineDiff';
import { ImageContent } from './ImageContent';
import { SubAgentDisplay } from './SubAgentDisplay';
import { FileTree } from './FileTree';
import { ReferencesList } from './ReferencesList';
import { InlineReference } from './InlineReference';
import { TurnPills } from './TurnPills';
import { WorkspaceEdit } from './WorkspaceEdit';
import { PlanReviewCard } from './PlanReviewCard';

// ─── ProgressStep ───

describe('ProgressStep', () => {
  test('renders message text', () => {
    renderWithChat(<ProgressStep kind="progress" message="Loading files" isActive />);
    expect(screen.getByText('Loading files')).toBeInTheDocument();
  });

  test('applies active class when active', () => {
    renderWithChat(<ProgressStep kind="progress" message="Running" isActive />);
    expect(screen.getByTestId('progress-step')).toHaveClass('ac-progress-step--active');
  });

  test('does not apply active class when inactive', () => {
    renderWithChat(<ProgressStep kind="progress" message="Done" isActive={false} />);
    expect(screen.getByTestId('progress-step')).not.toHaveClass('ac-progress-step--active');
  });
});

// ─── WorkingIndicator ───

describe('WorkingIndicator', () => {
  test('renders animated dots', () => {
    renderWithChat(<WorkingIndicator kind="working" />);
    expect(screen.getByTestId('working-indicator')).toBeInTheDocument();
  });

  test('renders optional message', () => {
    renderWithChat(<WorkingIndicator kind="working" message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });
});

// ─── EditPill ───

describe('EditPill', () => {
  test('renders filename basename', () => {
    renderWithChat(
      <EditPill
        kind="edit-pill"
        filename="src/utils/helpers.ts"
        status="modified"
        linesAdded={5}
        linesRemoved={2}
      />,
    );
    expect(screen.getByText('helpers.ts')).toBeInTheDocument();
  });

  test('renders diff stats', () => {
    renderWithChat(
      <EditPill
        kind="edit-pill"
        filename="test.ts"
        status="modified"
        linesAdded={10}
        linesRemoved={3}
      />,
    );
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  test('hides diff stats in compact mode', () => {
    renderWithChat(
      <EditPill
        kind="edit-pill"
        filename="test.ts"
        status="modified"
        linesAdded={10}
        linesRemoved={3}
        compact
      />,
    );
    expect(screen.queryByText('+10')).not.toBeInTheDocument();
  });

  test('fires onFileOpen when clicked with uri', async () => {
    const user = userEvent.setup();
    const onFileOpen = vi.fn();

    renderWithChat(
      <EditPill
        kind="edit-pill"
        filename="test.ts"
        uri="file:///test.ts"
        status="modified"
        linesAdded={1}
        linesRemoved={0}
      />,
      { callbacks: { onFileOpen } },
    );

    await user.click(screen.getByTestId('edit-pill'));
    expect(onFileOpen).toHaveBeenCalledWith('file:///test.ts');
  });

  test('renders progress bar when progress is set', () => {
    const { container } = renderWithChat(
      <EditPill
        kind="edit-pill"
        filename="test.ts"
        status="modified"
        linesAdded={1}
        linesRemoved={0}
        progress={75}
      />,
    );
    const progressBar = container.querySelector('.ac-edit-pill__progress');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  test('has accessible label', () => {
    renderWithChat(
      <EditPill
        kind="edit-pill"
        filename="utils.ts"
        status="modified"
        linesAdded={5}
        linesRemoved={2}
      />,
    );
    expect(screen.getByLabelText('utils.ts: 5 added, 2 removed')).toBeInTheDocument();
  });
});

// ─── FileChangesSummary ───

describe('FileChangesSummary', () => {
  const files = [
    { filename: 'src/a.ts', status: 'modified' as const, linesAdded: 10, linesRemoved: 2 },
    { filename: 'src/b.ts', status: 'created' as const, linesAdded: 50, linesRemoved: 0 },
  ];

  test('renders file count in title', () => {
    renderWithChat(
      <FileChangesSummary
        kind="file-changes-summary"
        files={files}
        totalAdded={60}
        totalRemoved={2}
      />,
    );
    expect(screen.getByText('Changed 2 files')).toBeInTheDocument();
  });

  test('renders total diff stats as subtitle', () => {
    renderWithChat(
      <FileChangesSummary
        kind="file-changes-summary"
        files={files}
        totalAdded={60}
        totalRemoved={2}
      />,
    );
    expect(screen.getByText('+60 -2')).toBeInTheDocument();
  });
});

// ─── TodoList ───

describe('TodoList', () => {
  const items = [
    { id: 1, title: 'Task A', status: 'completed' as const },
    { id: 2, title: 'Task B', status: 'in-progress' as const },
    { id: 3, title: 'Task C', status: 'not-started' as const },
  ];

  test('renders all todo items', () => {
    renderWithChat(<TodoList kind="todo-list" items={items} />);
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Task C')).toBeInTheDocument();
  });

  test('renders status icons', () => {
    renderWithChat(<TodoList kind="todo-list" items={items} />);
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('In progress')).toBeInTheDocument();
    expect(screen.getByLabelText('Not started')).toBeInTheDocument();
  });

  test('applies completed class with line-through', () => {
    const { container } = renderWithChat(<TodoList kind="todo-list" items={items} />);
    const completedItem = container.querySelector('.ac-todo-list__item--completed');
    expect(completedItem).toBeInTheDocument();
  });

  test('has list role', () => {
    renderWithChat(<TodoList kind="todo-list" items={items} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});

// ─── InlineDiff ───

describe('InlineDiff', () => {
  test('renders diff with added and removed lines', () => {
    renderWithChat(
      <InlineDiff
        kind="inline-diff"
        filename="test.ts"
        originalCode="const x = 1;"
        modifiedCode="const x = 2;"
        language="typescript"
      />,
    );
    expect(screen.getByTestId('inline-diff')).toBeInTheDocument();
  });

  test('displays filename', () => {
    renderWithChat(
      <InlineDiff
        kind="inline-diff"
        filename="utils.ts"
        originalCode="a"
        modifiedCode="b"
        language="ts"
      />,
    );
    expect(screen.getByText('utils.ts')).toBeInTheDocument();
  });
});

// ─── ImageContent ───

describe('ImageContent', () => {
  test('renders image with src', () => {
    const { container } = renderWithChat(
      <ImageContent kind="image" src="https://example.com/test.png" />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/test.png');
  });

  test('renders alt text', () => {
    renderWithChat(<ImageContent kind="image" src="test.png" alt="A test image" />);
    expect(screen.getByAltText('A test image')).toBeInTheDocument();
  });

  test('renders with dimensions', () => {
    const { container } = renderWithChat(
      <ImageContent kind="image" src="test.png" width={200} height={100} />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('width', '200');
    expect(img).toHaveAttribute('height', '100');
  });
});

// ─── SubAgentDisplay ───

describe('SubAgentDisplay', () => {
  test('renders agent description', () => {
    renderWithChat(
      <SubAgentDisplay
        kind="sub-agent"
        agentName="CodeReview"
        description="Reviewing code changes"
        status="running"
        isStreaming
      />,
    );
    expect(screen.getByText('Reviewing code changes')).toBeInTheDocument();
  });

  test('truncates long descriptions', () => {
    const longDesc = 'A'.repeat(150);
    renderWithChat(
      <SubAgentDisplay
        kind="sub-agent"
        agentName="Agent"
        description={longDesc}
        status="running"
        isStreaming
      />,
    );
    expect(screen.getByText(`${'A'.repeat(100)}…`)).toBeInTheDocument();
  });

  test('shows model name and credits in footer when expanded', async () => {
    renderWithChat(
      <SubAgentDisplay
        kind="sub-agent"
        agentName="Agent"
        description="Desc"
        status="complete"
        modelName="GPT-4"
        credits={5}
        isStreaming={false}
        autoExpand
      />,
    );
    // Auto-expand renders footer
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
    expect(screen.getByText('5 credits')).toBeInTheDocument();
  });
});

// ─── FileTree ───

describe('FileTree', () => {
  test('renders root directory', () => {
    renderWithChat(
      <FileTree
        kind="file-tree"
        root={{
          label: 'src',
          isDirectory: true,
          children: [{ label: 'index.ts', isDirectory: false, uri: 'file:///src/index.ts' }],
        }}
      />,
    );
    expect(screen.getByText('src')).toBeInTheDocument();
  });

  test('has tree role', () => {
    renderWithChat(
      <FileTree kind="file-tree" root={{ label: 'root', isDirectory: true, children: [] }} />,
    );
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });
});

// ─── ReferencesList ───

describe('ReferencesList', () => {
  test('renders reference count in title', () => {
    renderWithChat(
      <ReferencesList
        kind="references"
        references={[
          { label: 'auth.ts', uri: 'file:///auth.ts' },
          { label: 'utils.ts', uri: 'file:///utils.ts' },
        ]}
      />,
    );
    expect(screen.getByText('Used 2 references')).toBeInTheDocument();
  });

  test('renders custom title', () => {
    renderWithChat(
      <ReferencesList
        kind="references"
        title="Context files"
        references={[{ label: 'file.ts', uri: 'file:///file.ts' }]}
      />,
    );
    expect(screen.getByText('Context files')).toBeInTheDocument();
  });
});

// ─── InlineReference ───

describe('InlineReference', () => {
  test('renders reference text', () => {
    renderWithChat(
      <InlineReference kind="inline-reference" text="auth.ts:42" uri="file:///auth.ts" />,
    );
    expect(screen.getByText('auth.ts:42')).toBeInTheDocument();
  });

  test('fires onReferenceClick when clicked', async () => {
    const user = userEvent.setup();
    const onReferenceClick = vi.fn();

    renderWithChat(
      <InlineReference kind="inline-reference" text="auth.ts" uri="file:///auth.ts" />,
      { callbacks: { onReferenceClick } },
    );

    await user.click(screen.getByText('auth.ts'));
    expect(onReferenceClick).toHaveBeenCalledWith('file:///auth.ts');
  });
});

// ─── TurnPills ───

describe('TurnPills', () => {
  test('renders label and diff counts in summary', () => {
    const { container } = renderWithChat(
      <TurnPills
        kind="turn-pills"
        label="Turn 1"
        files={[{ filename: 'a.ts', status: 'modified', linesAdded: 5, linesRemoved: 2 }]}
        totalAdded={5}
        totalRemoved={2}
      />,
    );
    expect(screen.getByText('Turn 1')).toBeInTheDocument();
    // Use counts container to avoid multiple matches (summary + file list)
    const insertions = container.querySelector('.ac-turn-pills__insertions');
    expect(insertions).toHaveTextContent('+5');
    const deletions = container.querySelector('.ac-turn-pills__deletions');
    expect(deletions).toHaveTextContent('-2');
  });
});

// ─── WorkspaceEdit ───

describe('WorkspaceEdit', () => {
  test('renders operations as progress steps', () => {
    renderWithChat(
      <WorkspaceEdit
        kind="workspace-edit"
        operations={[
          { type: 'created', filename: 'new-file.ts' },
          { type: 'deleted', filename: 'old-file.ts' },
          { type: 'renamed', filename: 'old.ts', newFilename: 'new.ts' },
        ]}
      />,
    );
    expect(screen.getByText('+ Created new-file.ts')).toBeInTheDocument();
    expect(screen.getByText('× Deleted old-file.ts')).toBeInTheDocument();
    expect(screen.getByText('→ Renamed old.ts to new.ts')).toBeInTheDocument();
  });
});

// ─── PlanReviewCard ───

describe('PlanReviewCard', () => {
  test('renders plan title', () => {
    renderWithChat(
      <PlanReviewCard
        kind="plan-review"
        title="Refactoring Plan"
        content="Steps to refactor the module"
        isOutdated={false}
        status="pending"
      />,
    );
    expect(screen.getByText('Refactoring Plan')).toBeInTheDocument();
  });

  test('shows outdated badge', () => {
    renderWithChat(
      <PlanReviewCard
        kind="plan-review"
        title="Plan"
        content="Content"
        isOutdated
        status="pending"
      />,
    );
    expect(screen.getByText('Outdated')).toBeInTheDocument();
  });

  test('shows approve/reject buttons for pending status', () => {
    renderWithChat(
      <PlanReviewCard
        kind="plan-review"
        title="Plan"
        content="Content"
        isOutdated={false}
        status="pending"
      />,
    );
    expect(screen.getByLabelText('Approve')).toBeInTheDocument();
    expect(screen.getByLabelText('Reject')).toBeInTheDocument();
  });

  test('hides buttons for non-pending status', () => {
    renderWithChat(
      <PlanReviewCard
        kind="plan-review"
        title="Plan"
        content="Content"
        isOutdated={false}
        status="approved"
      />,
    );
    expect(screen.queryByLabelText('Approve')).not.toBeInTheDocument();
  });

  test('fires onPlanAction when approve is clicked', async () => {
    const user = userEvent.setup();
    const onPlanAction = vi.fn();

    renderWithChat(
      <PlanReviewCard
        kind="plan-review"
        title="My Plan"
        content="Content"
        isOutdated={false}
        status="pending"
      />,
      { callbacks: { onPlanAction } },
    );

    await user.click(screen.getByLabelText('Approve'));
    expect(onPlanAction).toHaveBeenCalledWith('My Plan', 'approve');
  });
});
