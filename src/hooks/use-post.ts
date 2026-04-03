"use client";

import { useState } from "react";

export interface PostResultItem {
  platformId: string;
  status: "success" | "failure" | "skipped" | "manual";
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

export function usePost() {
  const [posting, setPosting] = useState(false);
  const [results, setResults] = useState<PostResultItem[] | null>(null);

  async function submitPost(
    content: string,
    platformIds?: string[]
  ): Promise<PostResultItem[]> {
    setPosting(true);
    setResults(null);

    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platformIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Post failed");
      }

      setResults(data.results);
      return data.results;
    } finally {
      setPosting(false);
    }
  }

  function clearResults() {
    setResults(null);
  }

  return { posting, results, submitPost, clearResults };
}
