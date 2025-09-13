"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";

export default function useScoreboard() {
  return useQuery({
    queryKey: ["top10"],
    queryFn: () => axios.get("/score/top10").then((res) => res.data),
    refetchInterval: 5000, // Poll every 5s as backup
  });
}
