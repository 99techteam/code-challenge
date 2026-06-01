import { useState } from 'react';
import Problem1 from './problems/problem1';
import Problem2 from './problems/problem2';
import Problem3 from './problems/problem3';

const TABS = [
  { id: 1, label: 'Problem 1', component: <Problem1 /> },
  { id: 2, label: 'Problem 2', component: <Problem2 /> },
  { id: 3, label: 'Problem 3', component: <Problem3 /> },
];

function App() {
  const [activeTab, setActiveTab] = useState(1);

  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className='flex flex-col min-h-svh px-42 pb-24'>
      <header className='px-8 pt-6 pb-0 border-b border-[var(--border)]'>
        <h1 className='m-0 mb-5 text-2xl font-medium tracking-tight text-[var(--text-h)]'>
          Assessment
        </h1>
        <nav className='flex gap-1' role='tablist'>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role='tab'
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-5 py-2 rounded-t-lg border-b-2 text-sm cursor-pointer transition',
                activeTab === tab.id
                  ? 'text-[var(--accent)] border-[var(--accent)] font-semibold'
                  : 'text-[var(--text)] border-transparent hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className='flex-1 p-8' role='tabpanel'>
        <div className='max-w-3xl'>{active.component}</div>
      </main>
    </div>
  );
}

export default App;
