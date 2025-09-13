"use client";
import { useEffect } from "react";
import Header from "../components/Header";
import Scoreboard from "../components/Scoreboard";
import { useUserStore } from "../stores/userStore";
import Link from "next/link";

export default function Home() {
  const { user, loadUser } = useUserStore() as {
    user?: { username?: string; access_token?: string };
    clearUser: () => void;
    loadUser: () => void;
  };

  useEffect(() => {
    loadUser(); // load user từ localStorage khi refresh
  }, [loadUser]);

  if (!user?.access_token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please login or register to view the scoreboard
          </h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Login
            </Link>
            <Link
              href="/register"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Go to Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Header />
      <Scoreboard />
    </div>
  );
}
