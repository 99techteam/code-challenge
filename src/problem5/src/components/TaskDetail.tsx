import React, { useState, useEffect } from 'react';
import { mockApi, Task } from '../api';

const styles: { [key: string]: React.CSSProperties } = {
  detailContainer: { 
    padding: '24px', 
    border: '1px solid #333', 
    borderRadius: '8px', 
    backgroundColor: '#2a2a2a' 
  },
  backLink: { 
    display: 'inline-block', 
    marginBottom: '20px', 
    color: '#00aaff', 
    textDecoration: 'none', 
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  },
  title: { 
    marginTop: 0, 
    color: '#fff' 
  },
  detailItem: { 
    marginBottom: '10px', 
    color: '#ccc' 
  },
  loadingText: {
    color: '#fff',
  },
};

interface TaskDetailProps {
  taskId: string;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mockApi.getTaskById(taskId).then(fetchedTask => {
      if (fetchedTask) {
        setTask(fetchedTask);
      }
      setLoading(false);
    });
  }, [taskId]);

  if (loading) return <p style={styles.loadingText}>Loading task details...</p>;
  if (!task) return <p style={styles.loadingText}>Task not found. <a href="#/" style={styles.backLink}>Go back</a>.</p>;

  return (
    <div>
      <a 
        href="#/" 
        style={styles.backLink}
        onMouseEnter={e => e.currentTarget.style.color = '#0088cc'}
        onMouseLeave={e => e.currentTarget.style.color = '#00aaff'}
      >← Back to List</a>
      <div style={styles.detailContainer}>
        <h2 style={styles.title}>{task.title}</h2>
        <p style={styles.detailItem}><strong>Status:</strong> {task.completed ? 'Completed' : 'Active'}</p>
        <p style={styles.detailItem}><strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TaskDetail;
