"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteLeftOverButtonProps {
  leftoverId: string;
}

export function DeleteLeftOverButton({ leftoverId }: DeleteLeftOverButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this leftover?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/leftovers/${leftoverId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete leftover");
      }
    } catch (error) {
      alert("Failed to delete leftover");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}

