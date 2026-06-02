"use client";
import { useState } from "react";
import { type HistoryEntry, timeAgo } from "@/hooks/useHistory";
import CopyButton from "./CopyButton";

export default function HistoryPanel({ entries, onClear }: { entries: HistoryEntry[]; onClear: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (entries.length === 0) {
    return <p className="text-stone-500 text-sm">Nothing generated yet. Results appear here automatically.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-stone-400 text-xs uppercase tracking-widest">{entries.length} entries</p>
        <button onClick={onClear} className="text-stone-600 hover:text-stone-400 text-xs transition-colors">
          Clear all
        </button>
      </div>

      {entries.map(e => {
        const isOpen = expanded === e.id;
        return (
          <div key={e.id} className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                onClick={() => setExpanded(isOpen ? null : e.id)}
                className="flex-1 flex items-center gap-2 text-left min-w-0"
              >
                <span className="text-stone-200 text-sm truncate">{e.label}</span>
                <span className="text-stone-600 text-xs shrink-0">{timeAgo(e.timestamp)}</span>
                <span className="text-stone-600 text-xs shrink-0 ml-auto">{isOpen ? "▲" : "▼"}</span>
              </button>
              <CopyButton text={e.text} />
            </div>
            {isOpen && (
              <pre className="px-4 pb-4 text-stone-400 text-xs font-mono whitespace-pre-wrap leading-relaxed border-t border-stone-700 pt-3">
                {e.text}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
