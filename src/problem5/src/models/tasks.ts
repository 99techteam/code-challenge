import dbPromise from '../db';

// Define the Task interface
export interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

// Create a new task
export async function createTask(taskData: { title: string; description?: string }): Promise<number> {
    const db = await dbPromise;
    const { title, description } = taskData;
    const now = new Date().toISOString();
    const result = await db.run(
        'INSERT INTO tasks (title, description, completed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [title, description, 0, now, now] // completed defaults to false (0)
    );
    if (result.lastID === undefined) {
        throw new Error('Failed to retrieve lastID');
    }
    return result.lastID;
     // Return the ID of the newly created task
}

// List tasks with optional filters
export async function getTasks(filters: { completed?: boolean; title?: string }): Promise<Task[]> {
    const db = await dbPromise;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (filters.completed !== undefined) {
        query += ' AND completed = ?';
        params.push(filters.completed ? 1 : 0);
    }
    if (filters.title) {
        query += ' AND title LIKE ?';
        params.push(`%${filters.title}%`); // Partial match on title
    }

    const tasks = await db.all(query, params);
    // Convert completed from integer (0/1) to boolean
    return tasks.map(task => ({
        ...task,
        completed: !!task.completed
    }));
}

// Get a task by ID
export async function getTaskById(id: number): Promise<Task | null> {
    const db = await dbPromise;
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (task) {
        task.completed = !!task.completed; // Convert to boolean
    }
    return task || null;
}

// Update a task
export async function updateTask(id: number, updates: Partial<Task>): Promise<boolean> {
    const db = await dbPromise;
    let setClause = '';
    const params: any[] = [];

    // Build SET clause dynamically, excluding id, createdAt, and updatedAt
    for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
            setClause += `${key} = ?, `;
            params.push(key === 'completed' ? (value ? 1 : 0) : value); // Convert boolean to integer
        }
    }
    if (setClause === '') return false; // No fields to update
    setClause = setClause.slice(0, -2); // Remove trailing comma and space

    const now = new Date().toISOString();
    const query = `UPDATE tasks SET ${setClause}, updatedAt = ? WHERE id = ?`;
    params.push(now, id);

    const result = await db.run(query, params);
    return (result.changes ?? 0) > 0;
}

// Delete a task
export async function deleteTask(id: number): Promise<boolean> {
    const db = await dbPromise;
    const result = await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return (result.changes ?? 0) > 0;
}