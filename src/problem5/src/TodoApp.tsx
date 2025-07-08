import React from 'react';
import Router from './router';

const styles = {
  container: { 
    backgroundColor: '#242424',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '500px',
    padding: '24px',
    border: '1px solid #333',
  } as React.CSSProperties,
  header: { 
    textAlign: 'center',
    marginTop: 0,
    marginBottom: '24px',
    fontSize: '28px',
    color: '#00aaff',
    fontWeight: 700,
  } as React.CSSProperties,
};

const TodoApp: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Todo List</h1>
      <Router />
    </div>
  );
};

export default TodoApp;

