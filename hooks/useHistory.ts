"use client";
import { useState, useEffect } from "react";

export type HistoryEntry = {
  id: string;
  timestamp: number;
  label: string;
  text: string;
};

const KEY = "wwn-history";
const MAX = 50;

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setEntries(JSON.parse(stored));
    } catch {}
  }, []);

  function add(label: string, text: string) {
    setEntries(prev => {
      const next = [{ id: Date.now().toString(), timestamp: Date.now(), label, text }, ...prev].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function clear() {
    setEntries([]);
    try { localStorage.removeItem(KEY); } catch {}
  }

  return { entries, add, clear };
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
