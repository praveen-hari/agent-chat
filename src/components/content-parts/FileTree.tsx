/**
 * FileTree — hierarchical tree display of files/folders.
 *
 * @module components/content-parts/FileTree
 */

import { memo, useState, useCallback } from 'react';
import type { FileTreePart, TreeNode } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface FileTreeProps extends FileTreePart {
  /** Additional CSS class */
  className?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  onFileClick: (uri: string) => void;
}

const TreeNodeItem = memo(function TreeNodeItem({ node, level, onFileClick }: TreeNodeItemProps) {
  const [expanded, setExpanded] = useState(level === 0);

  const handleClick = useCallback(() => {
    if (node.isDirectory) {
      setExpanded((prev) => !prev);
    } else if (node.uri) {
      onFileClick(node.uri);
    }
  }, [node, onFileClick]);

  return (
    <>
      <div
        className={cn(
          'ac-file-tree__node',
          node.isDirectory ? 'ac-file-tree__node--dir' : 'ac-file-tree__node--file',
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role={node.isDirectory ? 'treeitem' : 'link'}
        tabIndex={0}
        aria-expanded={node.isDirectory ? expanded : undefined}
        aria-label={node.label}
      >
        <span className="ac-file-tree__icon" aria-hidden="true">
          {node.isDirectory ? (expanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="ac-file-tree__label">{node.label}</span>
      </div>
      {node.isDirectory &&
        expanded &&
        node.children?.map((child) => (
          <TreeNodeItem
            key={child.label}
            node={child}
            level={level + 1}
            onFileClick={onFileClick}
          />
        ))}
    </>
  );
});

export const FileTree = memo(function FileTree({ root, className }: FileTreeProps) {
  const { callbacks } = useChatContext();

  const handleFileClick = useCallback(
    (uri: string) => {
      callbacks.onFileOpen?.(uri);
    },
    [callbacks],
  );

  return (
    <div className={cn('ac-file-tree', className)} role="tree" data-testid="file-tree">
      <TreeNodeItem node={root} level={0} onFileClick={handleFileClick} />
    </div>
  );
});
