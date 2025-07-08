export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

export type FilterType = 'all' | 'active' | 'completed';

let tasksInDb: Task[] = [
  { id: '1', title: 'Build the UI', completed: true, createdAt: Date.now() - 20000 },
  { id: '2', title: 'Create mock API', completed: true, createdAt: Date.now() - 10000 },
  { id: '3', title: 'Write documentation', completed: false, createdAt: Date.now() },
];

export const mockApi = {
  getTasks: async (filter?: FilterType): Promise<Task[]> => {
    await new Promise(res => setTimeout(res, 200));
    let results = tasksInDb;
    if (filter === 'active') results = tasksInDb.filter(t => !t.completed);
    if (filter === 'completed') results = tasksInDb.filter(t => t.completed);
    return [...results].sort((a, b) => a.createdAt - b.createdAt);
  },

  getTaskById: async (id: string): Promise<Task | undefined> => {
    await new Promise(res => setTimeout(res, 200));
    return tasksInDb.find(t => t.id === id);
  },

  createTask: async (title: string): Promise<Task> => {
    await new Promise(res => setTimeout(res, 200));
    const newTask: Task = {
      id: String(Date.now()),
      title,
      completed: false,
      createdAt: Date.now(),
    };
    tasksInDb.push(newTask);
    return newTask;
  },

  updateTask: async (id: string, updates: Partial<Pick<Task, 'title' | 'completed'>>): Promise<Task | null> => {
    await new Promise(res => setTimeout(res, 200));
    const taskIndex = tasksInDb.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;
    tasksInDb[taskIndex] = { ...tasksInDb[taskIndex], ...updates };
    return tasksInDb[taskIndex];
  },

  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    await new Promise(res => setTimeout(res, 200));
    tasksInDb = tasksInDb.filter(t => t.id !== id);
    return { success: true };
  },
};
