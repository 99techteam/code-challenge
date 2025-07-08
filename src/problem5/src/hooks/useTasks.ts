import { useState, useEffect, useCallback } from 'react';
import { mockApi, Task } from '../api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mockApi.getTasks().then(initialTasks => {
      setTasks(initialTasks);
      setLoading(false);
    });
  }, []);

  const createTask = useCallback(async (title: string) => {
    const createdTask = await mockApi.createTask(title);
    setTasks(prev => [...prev, createdTask]);
  }, []);

  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    const updatedTask = await mockApi.updateTask(id, { completed: !completed });
    if (updatedTask) {
      setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await mockApi.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, createTask, toggleTask, deleteTask };
};
