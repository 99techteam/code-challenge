"use client";

import { useState } from "react";
import {
  useResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useRealtimeResources,
} from "@/hooks/resourceHooks";
import { Resource } from "@/hooks/resourceHooks";
import { toast } from "sonner";

export default function ResourcesPage() {
  useRealtimeResources();
  const { data: resources, isLoading, error } = useResources();
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<
    Omit<Resource, "_id" | "createdAt" | "updatedAt">
  >({ name: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      toast.promise(
        updateMutation.mutateAsync({ id: editingId, ...formData }),
        {
          loading: "Updating resource...",
          success: "Resource updated successfully!",
          error: "Failed to update resource.",
        }
      );
      setEditingId(null);
    } else {
      toast.promise(createMutation.mutateAsync(formData), {
        loading: "Creating resource...",
        success: "Resource created successfully!",
        error: "Failed to create resource.",
      });
    }

    setFormData({ name: "", description: "" });
  };

  const handleEdit = (resource: Resource) => {
    setEditingId(resource._id);
    setFormData({ name: resource.name, description: resource.description });
  };

  const handleDelete = (id: string) => {
    toast.promise(deleteMutation.mutateAsync(id), {
      loading: "Deleting resource...",
      success: "Resource deleted successfully!",
      error: "Failed to delete resource.",
    });
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold"> Resources CRUD (Realtime)</h1>

      {/* Form */}
      <div className="bg-white shadow-md rounded-xl p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Update Resource" : "Create Resource"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter resource name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Description
            </label>
            <input
              type="text"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", description: "" });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-xl p-6 border overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">All Resources</h2>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">#</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources?.map((resource, idx) => (
              <tr key={resource._id} className="hover:bg-gray-50">
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border font-medium">{resource.name}</td>
                <td className="p-3 border">{resource.description}</td>
                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(resource._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {resources?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No resources found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
