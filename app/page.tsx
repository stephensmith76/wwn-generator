"use client";
import { useState } from "react";
import NPCGenerator from "@/components/NPCGenerator";
import DungeonGenerator from "@/components/DungeonGenerator";
import MonsterGenerator from "@/components/MonsterGenerator";
import NameGenerator from "@/components/NameGenerator";
import HistoryPanel from "@/components/HistoryPanel";
import { useHistory } from "@/hooks/useHistory";

type Tab = "npc" | "dungeon" | "monster" | "names" | "log";

export default function Home() {
  const [tab, setTab] = useState<Tab>("npc");
  const { entries, add, clear } = useHistory();

  const tabs: { id: Tab; label: string }[] = [
    { id: "npc", label: "NPC" },
    { id: "dungeon", label: "Dungeon" },
    { id: "monster", label: "Monster" },
    { id: "names", label: "Names" },
    { id: "log", label: entries.length > 0 ? `Log (${entries.length})` : "Log" },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      <header className="border-b border-stone-800 px-6 py-4">
        <h1 className="text-amber-400 font-bold text-xl tracking-wide">Worlds Without Number — Generator</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 bg-stone-900 p-1 rounded-lg w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.id ? "bg-amber-600 text-stone-950" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "npc" && <NPCGenerator onAdd={add} />}
        {tab === "dungeon" && <DungeonGenerator onAdd={add} />}
        {tab === "monster" && <MonsterGenerator onAdd={add} />}
        {tab === "names" && <NameGenerator onAdd={add} />}
        {tab === "log" && <HistoryPanel entries={entries} onClear={clear} />}
      </div>
    </div>
  );
}
