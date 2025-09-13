/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUserStore } from "@/stores/userStore";
import axios from "../lib/axios";
import useScoreboard from "@/hooks/useScoreboard";

export default function Scoreboard() {
  const { data: top10 = [], isLoading } = useScoreboard();
  const { user } = useUserStore() as {
    user?: { username?: string; access_token?: string };
    clearUser: () => void;
  };

  const performAction = async () => {
    if (!user?.access_token) return;
    try {
      await axios.post(
        "/score/update",
        {},
        {
          headers: { Authorization: `Bearer ${user.access_token}` },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="list-disc pl-5">
          {top10.map((userItem: any, idx: number) => (
            <li key={idx} className="mb-2">
              {userItem.username}: {userItem.score}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={performAction}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        disabled={!user}
      >
        Perform Action (Increment Score)
      </button>
    </>
  );
}
