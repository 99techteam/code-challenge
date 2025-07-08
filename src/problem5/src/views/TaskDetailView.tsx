import React from 'react';
import TaskDetail from '../components/TaskDetail';

interface TaskDetailViewProps {
  taskId: string;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ taskId }) => {
  return <TaskDetail taskId={taskId} />;
};

export default TaskDetailView;
