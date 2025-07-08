import React, { useState, useEffect } from 'react';
import TaskListView from './views/TaskListView';
import TaskDetailView from './views/TaskDetailView';

const NotFound = () => <p>Page Not Found. <a href="#/">Go home</a></p>;

const Router: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route.startsWith('#/tasks/')) {
    const taskId = route.split('/')[2];
    return <TaskDetailView taskId={taskId} />;
  }

  if (route === '#/' || route === '') {
    return <TaskListView />;
  }

  return <NotFound />;
};

export default Router;
