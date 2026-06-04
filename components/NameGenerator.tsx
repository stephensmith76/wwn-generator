"use client";
import { useState, useCallback } from "react";
import { nameData } from "@/data/names";
import CopyButton from "./CopyButton";

type NameEntry = {
  id: string;
  name: string;
  phonetic: string;
  meaning: string;
  category: string;
  pinned: boolean;
};

function weightedRandom(arr: string[], weights: number[]): string {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function syllable(allowEmpty = false): string {
  const onset =
    Math.random() < 0.15 && allowEmpty
      ? ""
      : weightedRandom(nameData.onsets, nameData.onsetWeights);
  const vowel = weightedRandom(nameData.vowels, nameData.vowelWeights);
  const coda = nameData.codas[Math.floor(Math.random() * nameData.codas.length)];
  return onset + vowel + coda;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const LIVONIAN_VOWELS = new Set([...'aāeēiīoōuūõ']);

const PHONETIC_SUBS: [RegExp, string][] = [
  [/ā/g, 'ah'], [/ē/g, 'ay'], [/ī/g, 'ee'],
  [/ō/g, 'oh'], [/ū/g, 'oo'], [/õ/g, 'uh'],
  [/š/g, 'sh'], [/ž/g, 'zh'], [/ļ/g, 'ly'], [/ņ/g, 'ny'], [/ƕ/g, 'wh'],
];

function substitute(s: string): string {
  for (const [re, rep] of PHONETIC_SUBS) s = s.replace(re, rep);
  return s;
}

function toPhonetic(name: string): string {
  const lower = name.toLowerCase();

  // Collect vowel positions (each diacritic char is one Unicode char)
  const vowelPos: number[] = [];
  for (let i = 0; i < lower.length; i++) {
    if (LIVONIAN_VOWELS.has(lower[i])) vowelPos.push(i);
  }
  if (vowelPos.length === 0) return name.toUpperCase();

  // Build syllable cut points
  const cuts: number[] = [0];
  for (let v = 1; v < vowelPos.length; v++) {
    const prev = vowelPos[v - 1];
    const curr = vowelPos[v];
    const between = lower.slice(prev + 1, curr); // consonants between vowels
    if (between.length === 0) {
      cuts.push(curr);           // adjacent vowels: split them
    } else {
      cuts.push(curr - 1);       // consonant(s): last one becomes onset of next syllable
    }
  }
  cuts.push(lower.length);

  // Build syllables with substitutions applied
  const syllables: string[] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    syllables.push(substitute(lower.slice(cuts[i], cuts[i + 1])));
  }

  // Stress on first syllable
  syllables[0] = syllables[0].toUpperCase();
  return syllables.join('-');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeName(cat: string): string {
  const r = Math.random();
  if (cat === "place") {
    const pre = pick(nameData.placePrefix);
    const suf = pick(nameData.placeSuffix);
    return pre ? cap(pre) + syllable(false) + suf : cap(syllable()) + syllable(true) + suf;
  }
  if (cat === "person") {
    const suf = pick(nameData.personSuffix);
    const len = r < 0.4 ? 2 : r < 0.8 ? 3 : 4;
    let stem = cap(syllable());
    for (let i = 1; i < len - 1; i++) stem += syllable(true);
    return stem + suf;
  }
  if (cat === "god") {
    const suf = pick(nameData.godSuffix);
    const len = r < 0.3 ? 2 : r < 0.7 ? 3 : 4;
    let stem = cap(syllable());
    for (let i = 1; i < len - 1; i++) stem += syllable(false);
    return stem + suf;
  }
  if (cat === "clan") {
    return cap(syllable()) + syllable(true) + pick(nameData.clanSuffix);
  }
  if (cat === "creature") {
    return cap(syllable()) + (r < 0.5 ? syllable(true) : "") + pick(nameData.creatureSuffix);
  }
  // artifact
  return cap(syllable()) + syllable(false) + pick(nameData.artifactSuffix);
}

function makeEntry(cat: string): NameEntry {
  const name = makeName(cat);
  return {
    id: Math.random().toString(36).slice(2),
    name,
    phonetic: toPhonetic(name),
    meaning: pick(nameData.meanings[cat]),
    category: cat,
    pinned: false,
  };
}

function allNamesToText(entries: NameEntry[]): string {
  return entries.map(e => `${e.name}  [${e.phonetic}]  — ${e.meaning}`).join("\n");
}

const pronunciationGuide = [
  { chars: "ā  ē  ī  ō  ū", hint: "Long vowels — hold each about twice as long as the plain version. ā like \"father\", ē like \"they\", ī like \"see\", ō like \"go\", ū like \"moon\"." },
  { chars: "õ", hint: "Livonian's most distinctive sound. Somewhere between \"uh\" and \"oh\" with unrounded lips — like the vowel in \"her\" without the R, or Estonian õ. Aim for the back of the mouth, relaxed." },
  { chars: "š", hint: "Like English \"sh\" — shore, shadow, ship." },
  { chars: "ž", hint: "Like the \"s\" in \"measure\" or \"treasure\", or French \"j\" in \"bonjour\"." },
  { chars: "ļ", hint: "Soft (palatalized) L — blend \"l\" and \"y\" together quickly, like the \"ll\" in Italian \"meglio\" or \"ly\" in \"million\"." },
  { chars: "ņ", hint: "Soft (palatalized) N — like \"ny\" said as one sound: Spanish ñ, or the \"ni\" in \"onion\", or French \"gn\" in \"montagne\"." },
  { chars: "ƕ", hint: "A breathy W — like the \"wh\" in \"where\" or \"whale\" in accents that distinguish it from plain W." },
];

function PronunciationGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-stone-800 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-stone-500 hover:text-stone-300 text-xs flex items-center gap-1 transition-colors"
      >
        <span>{open ? "▲" : "▼"}</span>
        Pronunciation guide
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {pronunciationGuide.map((row) => (
            <div key={row.chars} className="flex gap-3">
              <span className="text-amber-400 font-mono text-sm shrink-0 min-w-[4rem]">{row.chars}</span>
              <span className="text-stone-400 text-xs leading-relaxed">{row.hint}</span>
            </div>
          ))}
          <p className="text-stone-600 text-xs pt-1">
            Unmarked vowels (a e i o u) and consonants are roughly as in English or Italian. Stress generally falls on the first syllable.
          </p>
        </div>
      )}
    </div>
  );
}

type Props = { onAdd: (label: string, text: string) => void };

export default function NameGenerator({ onAdd }: Props) {
  const [activeCategory, setActiveCategory] = useState("place");
  const [count, setCount] = useState(6);
  const [names, setNames] = useState<NameEntry[]>([]);

  const generate = useCallback(
    (cat = activeCategory, n = count, existing: NameEntry[] = []) => {
      const pinned = existing.filter((e) => e.pinned);
      const needed = Math.max(n - pinned.length, 0);
      const fresh = Array.from({ length: needed }, () => makeEntry(cat));
      const result = [...pinned, ...fresh];
      setNames(result);
      if (result.length > 0) {
        onAdd(
          `Names (${cat})`,
          result.map((e) => `${e.name}  [${e.phonetic}]  — ${e.meaning}`).join("\n")
        );
      }
    },
    [activeCategory, count, onAdd]
  );

  function switchCategory(cat: string) {
    setActiveCategory(cat);
    // Don't carry pinned names across category switches
    const n = Math.max(count, 1);
    const fresh = Array.from({ length: n }, () => makeEntry(cat));
    setNames(fresh);
    onAdd(`Names (${cat})`, fresh.map((e) => `${e.name}  [${e.phonetic}]  — ${e.meaning}`).join("\n"));
  }

  function togglePin(id: string) {
    setNames((prev) => prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)));
  }

  function rerollOne(id: string) {
    setNames((prev) =>
      prev.map((e) =>
        e.id === id && !e.pinned ? makeEntry(activeCategory) : e
      )
    );
  }

  const catLabel = nameData.categories.find((c) => c.id === activeCategory)?.label ?? activeCategory;

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {nameData.categories.map((c) => (
          <button
            key={c.id}
            onClick={() => switchCategory(c.id)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeCategory === c.id
                ? "bg-amber-600 text-stone-950"
                : "bg-stone-700 hover:bg-stone-600 text-stone-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => generate(activeCategory, count, names)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors"
        >
          ↻ Generate
        </button>
        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-sm">Count:</span>
          <input
            type="range"
            min={1}
            max={9}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24 accent-amber-500"
          />
          <span className="text-stone-200 text-sm font-bold w-4">{count}</span>
        </div>
        {names.length > 0 && (
          <CopyButton text={allNamesToText(names)} className="ml-auto" />
        )}
      </div>

      {/* Name cards */}
      {names.length === 0 ? (
        <p className="text-stone-500 text-sm">Choose a category and generate.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {names.map((entry) => (
            <div
              key={entry.id}
              className={`bg-stone-800 rounded-lg p-4 border transition-colors ${
                entry.pinned ? "border-amber-600" : "border-stone-700"
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs text-amber-500 bg-amber-950 px-2 py-0.5 rounded capitalize">
                  {catLabel}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => rerollOne(entry.id)}
                    title="Re-roll"
                    className={`text-xs transition-colors ${
                      entry.pinned
                        ? "text-stone-600 cursor-not-allowed"
                        : "text-stone-500 hover:text-amber-400"
                    }`}
                    disabled={entry.pinned}
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => togglePin(entry.id)}
                    title={entry.pinned ? "Unpin" : "Pin"}
                    className={`text-xs transition-colors ${
                      entry.pinned ? "text-amber-400" : "text-stone-500 hover:text-amber-400"
                    }`}
                  >
                    {entry.pinned ? "📌" : "📍"}
                  </button>
                </div>
              </div>
              <p className="text-stone-100 font-semibold text-lg leading-tight">
                {entry.name}
              </p>
              <p className="text-stone-500 text-xs font-mono mb-1">{entry.phonetic}</p>
              <p className="text-stone-400 text-xs leading-snug">{entry.meaning}</p>
            </div>
          ))}
        </div>
      )}

      {names.some((e) => e.pinned) && (
        <p className="text-stone-500 text-xs">
          📌 Pinned names are preserved on next generate.
        </p>
      )}

      <PronunciationGuide />
    </div>
  );
}
