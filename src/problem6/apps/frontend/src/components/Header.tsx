"use client";

import { useUserStore } from "../stores/userStore";

export default function Header() {
  const { user, clearUser } = useUserStore() as {
    user?: { username?: string };
    clearUser: () => void;
  };
  return (
    <header className="flex justify-between items-center mb-4">
      <h1 className="text-3xl font-bold">Scoreboard</h1>
      <div className="flex items-center">
        <span className="mr-4">Welcome, {user?.username}</span>
        <button
          onClick={clearUser}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
