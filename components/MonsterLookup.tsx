"use client";
import { useState, useMemo } from "react";
import { mmMonsters, type MMMonster } from "@/data/mmMonsters";
import CopyButton from "./CopyButton";

function monsterToText(m: MMMonster): string {
  return [
    `${m.name}`,
    `AC: ${m.ac} (1e AC ${m.acOriginal}) | HD: ${m.hd} | Move: ${m.move}`,
    `Attacks: ${m.attacks} | Damage: ${m.damage}`,
    m.specialAttacks && m.specialAttacks !== 'Nil' ? `Special Attacks: ${m.specialAttacks}` : '',
    m.specialDefenses && m.specialDefenses !== 'Nil' ? `Special Defenses: ${m.specialDefenses}` : '',
    m.magicResistance && m.magicResistance !== 'Standard' && m.magicResistance !== 'Stondord' ? `MR: ${m.magicResistance}` : '',
    `Intel: ${m.intelligence} | Align: ${m.alignment} | Size: ${m.size}`,
  ].filter(Boolean).join('\n');
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-stone-700 rounded px-2 py-1 min-w-[3.5rem]">
      <span className="text-stone-400 text-xs leading-none">{label}</span>
      <span className="text-stone-100 text-sm font-bold leading-tight mt-0.5">{value}</span>
    </div>
  );
}

export default function MonsterLookup() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MMMonster | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mmMonsters;
    return mmMonsters.filter(m => m.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setSelected(null); }}
        placeholder="Search monsters…"
        className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
      />
      <p className="text-stone-500 text-xs">{results.length} of {mmMonsters.length} monsters — ACs converted to WWN ascending</p>

      {selected && (
        <div className="bg-stone-800 border border-amber-700 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-amber-300 font-bold text-lg leading-tight">{selected.name}</p>
              <p className="text-stone-500 text-xs mt-0.5">
                1e AC {selected.acOriginal} → WWN AC {selected.ac}
                {selected.frequency ? ` · ${selected.frequency}` : ''}
                {selected.alignment ? ` · ${selected.alignment}` : ''}
              </p>
            </div>
            <CopyButton text={monsterToText(selected)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatBadge label="AC (WWN)" value={selected.ac} />
            <StatBadge label="HD" value={selected.hd || '—'} />
            <StatBadge label="Move" value={selected.move || '—'} />
            <StatBadge label="Attacks" value={selected.attacks || '—'} />
            <StatBadge label="Damage" value={selected.damage || '—'} />
            {selected.size && <StatBadge label="Size" value={selected.size} />}
          </div>

          {(selected.specialAttacks && selected.specialAttacks !== 'Nil') && (
            <div>
              <span className="text-red-400 text-xs font-bold uppercase">Special Attacks </span>
              <span className="text-stone-300 text-sm">{selected.specialAttacks}</span>
            </div>
          )}
          {(selected.specialDefenses && selected.specialDefenses !== 'Nil') && (
            <div>
              <span className="text-blue-400 text-xs font-bold uppercase">Special Defenses </span>
              <span className="text-stone-300 text-sm">{selected.specialDefenses}</span>
            </div>
          )}
          {(selected.magicResistance && !['Standard', 'Stondord', 'Stondord', ''].includes(selected.magicResistance)) && (
            <div>
              <span className="text-purple-400 text-xs font-bold uppercase">MR </span>
              <span className="text-stone-300 text-sm">{selected.magicResistance}</span>
            </div>
          )}
          {selected.intelligence && (
            <div className="text-stone-400 text-xs">Intel: {selected.intelligence}</div>
          )}
        </div>
      )}

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {results.map(m => (
          <button
            key={m.name}
            onClick={() => setSelected(selected?.name === m.name ? null : m)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
              selected?.name === m.name
                ? 'bg-stone-700 border border-amber-700'
                : 'bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:border-stone-600'
            }`}
          >
            <span className="text-stone-200 text-sm">{m.name}</span>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="text-stone-500 text-xs">AC {m.ac}</span>
              <span className="text-stone-500 text-xs">HD {m.hd}</span>
              {m.frequency && <span className="text-stone-600 text-xs hidden sm:inline">{m.frequency}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
