/**
 * TodoListDock — dockable todo list widget that floats above the input area.
 * Shows pending item count badge and toggleable item list.
 *
 * @module components/TodoListDock
 */

import { memo, useState, useCallback } from 'react';
import type { TodoItem } from '../types/content-parts';
import { cn } from '../utils/cn';
import { Badge } from './atoms/Badge';
import { Icon } from './atoms/Icon';
import { StatusIcon } from './atoms/StatusIcon';
import { IconButton } from './atoms/IconButton';

export interface TodoListDockProps {
  /** Todo items to display */
  items: TodoItem[];
  /** Whether the dock is initially visible (default: true) */
  defaultVisible?: boolean;
  /** Additional CSS class */
  className?: string;
}

/** Map todo status to StatusIcon status */
function mapTodoStatus(status: TodoItem['status']) {
  switch (status) {
    case 'completed':
      return 'complete' as const;
    case 'in-progress':
      return 'running' as const;
    case 'not-started':
      return 'pending' as const;
  }
}

export const TodoListDock = memo(function TodoListDock({
  items,
  defaultVisible = true,
  className,
}: TodoListDockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible || items.length === 0) return null;

  const pendingCount = items.filter((i) => i.status !== 'completed').length;

  return (
    <div
      className={cn('ac-todo-dock', !isExpanded && 'ac-todo-dock--collapsed', className)}
      data-testid="todo-list-dock"
    >
      <div className="ac-todo-dock__header">
        <button
          className="ac-todo-dock__toggle"
          onClick={toggleExpand}
          aria-expanded={isExpanded}
          aria-label={`Todos, ${pendingCount} remaining`}
        >
          <span className="ac-todo-dock__chevron" aria-hidden="true">
            <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} />
          </span>
          <span className="ac-todo-dock__title">Todos</span>
          {pendingCount > 0 && <Badge count={pendingCount} variant="info" />}
        </button>
        <IconButton icon="close" label="Close" onClick={handleClose} size="small" />
      </div>

      {isExpanded && (
        <div className="ac-todo-dock__list">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'ac-todo-dock__item',
                item.status === 'completed' && 'ac-todo-dock__item--done',
              )}
            >
              <StatusIcon status={mapTodoStatus(item.status)} size={14} />
              <span
                className={cn(
                  'ac-todo-dock__item-title',
                  item.status === 'completed' && 'ac-todo-dock__item-title--done',
                )}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
