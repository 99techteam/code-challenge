import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Task, FilterType } from '../api';
import TaskItem from './TaskItem';

const styles = {
  filters: { display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' } as React.CSSProperties,
  filterButton: (isActive: boolean): React.CSSProperties => ({
    padding: '4px 8px',
    border: 'none',
    background: 'transparent',
    color: isActive ? '#00aaff' : '#888',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  }),
  taskList: { listStyle: 'none', padding: 0 } as React.CSSProperties,
};

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onToggle, onDelete }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    if (filter === 'active') return tasks.filter(t => !t.completed);
    return tasks.filter(t => t.completed);
  }, [tasks, filter]);

  return (
    <div>
      <div style={styles.filters}>
        {(['all', 'active', 'completed'] as FilterType[]).map(f => (
                    <button 
            key={f} 
            style={styles.filterButton(filter === f)} 
            onClick={() => setFilter(f)}
            onMouseEnter={e => { if (filter !== f) e.currentTarget.style.color = '#ccc'; }}
            onMouseLeave={e => { if (filter !== f) e.currentTarget.style.color = '#888'; }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <p>Loading...</p> : (
        <AnimatePresence>
          <ul style={styles.taskList}>
            {filteredTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </ul>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TaskList;
