import React from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskList from '../components/TaskList';
import AddTaskForm from '../components/AddTaskForm';

const TaskListView: React.FC = () => {
  const { tasks, loading, createTask, toggleTask, deleteTask } = useTasks();

  return (
    <div>
      <AddTaskForm onCreate={createTask} />
      <TaskList
        tasks={tasks}
        loading={loading}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default TaskListView;
