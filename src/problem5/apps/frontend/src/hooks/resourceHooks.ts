// src/hooks/resourceHooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useEffect } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/resource";

// Types
export interface Resource {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

const fetchResources = async (): Promise<Resource[]> => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const fetchResource = async (id: string): Promise<Resource> => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const createResource = async (
  data: Omit<Resource, "_id" | "createdAt" | "updatedAt">
): Promise<Resource> => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
};

const updateResource = async (
  id: string,
  data: Partial<Omit<Resource, "_id" | "createdAt" | "updatedAt">>
): Promise<Resource> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
};

const deleteResource = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete");
};

// Hooks
export function useResources() {
  return useQuery({
    queryKey: ["resources"],
    queryFn: fetchResources,
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ["resource", id],
    queryFn: () => fetchResource(id),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] }); // Refetch list
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & Partial<Omit<Resource, "_id">>) =>
      updateResource(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource", variables.id] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteResource,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.removeQueries({ queryKey: ["resource", id] });
    },
  });
}

// Realtime Socket Hook
export function useRealtimeResources() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket: Socket = io(
      process.env.NEXT_PUBLIC_WS_BASE || "http://localhost:8000"
    ); // Kết nối WS đến backend

    socket.on("connect", () => {
      console.log("Connected to realtime server");
    });

    socket.on("resource.created", (newResource: Resource) => {
      queryClient.setQueryData(["resources"], (old: Resource[] | undefined) => [
        ...(old || []),
        newResource,
      ]);
      console.log("New resource created realtime:", newResource);
    });

    socket.on("resource.updated", (updatedResource: Resource) => {
      queryClient.setQueryData(["resources"], (old: Resource[] | undefined) =>
        (old || []).map((r) =>
          r._id === updatedResource._id ? updatedResource : r
        )
      );
      queryClient.setQueryData(
        ["resource", updatedResource._id],
        updatedResource
      );
      console.log("Resource updated realtime:", updatedResource);
    });

    socket.on("resource.deleted", (id: string) => {
      queryClient.setQueryData(["resources"], (old: Resource[] | undefined) =>
        (old || []).filter((r) => r._id !== id)
      );
      queryClient.removeQueries({ queryKey: ["resource", id] });
      console.log("Resource deleted realtime:", id);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
