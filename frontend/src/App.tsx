import { useState, useEffect } from 'react';
import type { AuthSession } from './types';
import { Layout } from './components/Layout';
import { SwapPage } from './pages/SwapPage';
import { WalletPage } from './pages/WalletPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { CoinsPage } from './pages/CoinsPage';
import { useCoins } from './hooks/useCoins';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const [activeTab, setActiveTab] = useState<'swap' | 'wallet' | 'scoreboard' | 'coins'>('swap');
  const [session, setSession] = useState<AuthSession | null>(null);
  // localScore is always fetched from the server — never persisted in localStorage
  const [localScore, setLocalScore] = useState<number>(0);

  const { coins, loading, refetch } = useCoins();
  const { scores } = useWebSocket();

  const fetchMyScore = (token: string) => {
    fetch('http://localhost:3001/api/scores/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid session');
        return res.json();
      })
      .then(data => setLocalScore(data.score))
      .catch(() => {
        // Token is invalid (e.g. DB was wiped). Clear and start fresh.
        localStorage.removeItem('crypto_dash_session');
        createNewSession();
      });
  };

  const createNewSession = () => {
    fetch('http://localhost:3001/api/scores/session', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        // Only store the token + username — score always comes from server
        localStorage.setItem('crypto_dash_session', JSON.stringify({ username: data.username, token: data.token }));
        setSession({ username: data.username, token: data.token });
        setLocalScore(data.score); // new sessions start at 40
      })
      .catch(console.error);
  };

  // On mount: restore or create session, then fetch current score from server
  useEffect(() => {
    const saved = localStorage.getItem('crypto_dash_session');
    if (saved) {
      const parsed = JSON.parse(saved) as AuthSession;
      setSession(parsed);
      fetchMyScore(parsed.token); // always pull fresh score from server
    } else {
      createNewSession();
    }
  }, []);

  // Sync localScore if user breaks into the WebSocket top-10 broadcast
  useEffect(() => {
    if (!session?.username) return;
    const top10Entry = scores.find(s => s.username === session.username);
    if (top10Entry) {
      setLocalScore(top10Entry.score);
    }
  }, [scores, session?.username]);

  // Called by SwapPage when the swap response returns a fresh server score
  const handleScoreUpdate = (newScore: number) => {
    setLocalScore(newScore);
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      username={session?.username}
      score={localScore}
    >
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center text-slate-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className={activeTab === 'swap' ? 'block' : 'hidden'}>
            <SwapPage coins={coins} sessionToken={session?.token} onScoreUpdate={handleScoreUpdate} />
          </div>

          <div className={activeTab === 'wallet' ? 'block' : 'hidden'}>
            <WalletPage coins={coins} />
          </div>

          <div className={activeTab === 'scoreboard' ? 'block' : 'hidden'}>
            <ScoreboardPage scores={scores} currentUsername={session?.username} />
          </div>

          <div className={activeTab === 'coins' ? 'block' : 'hidden'}>
            <CoinsPage coins={coins} refetch={refetch} />
          </div>
        </>
      )}
    </Layout>
  );
}

export default App;
