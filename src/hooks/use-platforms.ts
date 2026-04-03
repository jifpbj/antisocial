"use client";

import { useState, useEffect, useCallback } from "react";

export interface PlatformInfo {
  id: string;
  name: string;
  isConnected: boolean;
  lastVerifiedAt: string | null;
  authType: "credentials" | "token" | "manual";
  maxLength: number | null;
  credentialFields: {
    key: string;
    label: string;
    type: "text" | "password";
    placeholder?: string;
    helpText?: string;
    helpUrl?: string;
  }[];
}

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/platforms");
      const data = await res.json();
      setPlatforms(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { platforms, loading, refresh };
}
