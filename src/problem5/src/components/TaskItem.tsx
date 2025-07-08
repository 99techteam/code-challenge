import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../api';

const styles = {
  taskItem: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 8px', 
    borderBottom: '1px solid #333', 
    transition: 'background-color 0.3s ease' 
  } as React.CSSProperties,
  taskTitle: (completed: boolean): React.CSSProperties => ({
    flexGrow: 1,
    cursor: 'pointer',
    textDecoration: completed ? 'line-through' : 'none',
    color: completed ? '#666' : '#fff',
    fontWeight: completed ? 400 : 700,
    transition: 'color 0.3s ease',
  }),
  deleteButton: { 
    border: 'none', 
    background: 'transparent', 
    color: '#ff4d4d', 
    cursor: 'pointer', 
    fontSize: '1.125rem', 
    marginLeft: '12px', 
    transition: 'color 0.3s ease, transform 0.2s ease' 
  } as React.CSSProperties,
  detailsLink: { 
    textDecoration: 'none', 
    color: '#00d1b2', 
    marginLeft: '12px', 
    fontWeight: 'bold', 
    transition: 'color 0.3s ease' 
  } as React.CSSProperties,
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
      style={styles.taskItem}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <span style={styles.taskTitle(task.completed)} onClick={() => onToggle(task.id, task.completed)}>
        {task.title}
      </span>
      <a 
        href={`#/tasks/${task.id}`} 
        style={styles.detailsLink}
        onMouseEnter={e => e.currentTarget.style.color = '#33fff0'}
        onMouseLeave={e => e.currentTarget.style.color = '#00d1b2'}
      >Details</a>
      <button 
        style={styles.deleteButton} 
        onClick={() => onDelete(task.id)}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#ff8080'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#ff4d4d'; }}
      >✖</button>
    </motion.li>
  );
};

export default TaskItem;
