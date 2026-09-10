/**
 * TodoList — displays the agent's task list with status indicators.
 *
 * @module components/content-parts/TodoList
 */

import { memo } from 'react';
import type { TodoListPart, TodoItemStatus } from '../../types/content-parts';
import { cn } from '../../utils/cn';

export interface TodoListProps extends TodoListPart {
  /** Additional CSS class */
  className?: string;
}

const STATUS_ICONS: Record<TodoItemStatus, string> = {
  completed: '✓',
  'in-progress': '●',
  'not-started': '○',
};

const STATUS_LABELS: Record<TodoItemStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
};

export const TodoList = memo(function TodoList({ items, className }: TodoListProps) {
  return (
    <div className={cn('ac-todo-list', className)} data-testid="todo-list" role="list">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn('ac-todo-list__item', `ac-todo-list__item--${item.status}`)}
          role="listitem"
        >
          <span
            className={cn('ac-todo-list__status', `ac-todo-list__status--${item.status}`)}
            aria-label={STATUS_LABELS[item.status]}
          >
            {STATUS_ICONS[item.status]}
          </span>
          <span className="ac-todo-list__title">{item.title}</span>
        </div>
      ))}
    </div>
  );
});
