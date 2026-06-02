"use client";
import { useState } from "react";

export default function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={copy}
      className={`text-xs px-2 py-1 rounded transition-colors ${
        copied
          ? "bg-green-800 text-green-300"
          : "bg-stone-700 hover:bg-stone-600 text-stone-400 hover:text-stone-200"
      } ${className}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
