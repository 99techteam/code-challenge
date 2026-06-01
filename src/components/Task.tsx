import type { ReactNode } from 'react'
import './Task.css'

interface TaskProps {
  title?: string
  children: ReactNode
}

export default function Task({ title = 'Task', children }: TaskProps) {
  return (
    <section className="task-card">
      <div className="task-header">
        <span className="task-badge">Task</span>
        <h2 className="task-title">{title}</h2>
      </div>
      <div className="task-body">{children}</div>
    </section>
  )
}
