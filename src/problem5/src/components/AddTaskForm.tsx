import React, { useState } from 'react';

const styles = {
  inputForm: { display: 'flex', marginBottom: '24px' } as React.CSSProperties,
  input: { 
    flexGrow: 1, 
    padding: '12px 16px', 
    border: '2px solid #333', 
    borderRadius: '8px 0 0 8px', 
    fontSize: '1rem', 
    outline: 'none', 
    backgroundColor: '#1a1a1a',
    color: '#fff',
    transition: 'border-color 0.3s ease' 
  } as React.CSSProperties,
  addButton: { 
    padding: '12px 24px', 
    border: 'none', 
    backgroundColor: '#00aaff', 
    color: 'white', 
    borderRadius: '0 8px 8px 0', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: 'bold', 
    transition: 'background-color 0.3s ease' 
  } as React.CSSProperties,
};

interface AddTaskFormProps {
  onCreate: (title: string) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title);
    setTitle('');
  };

  return (
    <form style={styles.inputForm} onSubmit={handleSubmit}>
      <input
        style={styles.input}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Add a new task..."
        onFocus={e => e.target.style.borderColor = '#00aaff'}
        onBlur={e => e.target.style.borderColor = '#333'}
      />
      <button 
        style={styles.addButton} 
        type="submit"
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0088cc')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00aaff')}
      >Add</button>
    </form>
  );
};

export default AddTaskForm;
