"use client";
import { useState } from "react";
import { monsterData } from "@/data/monster";
import { pick } from "@/data/utils";
import CopyButton from "./CopyButton";
import MonsterLookup from "./MonsterLookup";
import { mmMonsters, mmEncounterGroups } from "@/data/mmMonsters";

type MonsterResult = {
  animalType: string;
  bodyPlan: string;
  huntingMethod: string;
  whyNotDead: string;
  bodyPart1: { type: string; trait: string };
  bodyPart2: { type: string; trait: string };
  drive: (typeof monsterData.monstrousDrives)[0];
  isBlighted: boolean;
  blightedIntent: string;
  blightedQuality: string;
  howArose: string;
  pastConnection: string;
  localContact: string;
  localReaction: string;
  scarsLeft: string;
  twist: string;
  statCategory: StatCategory;
  statLine: (typeof monsterData.statLines.animals)[0];
};

type EncounterResult = {
  type: "Human" | "Nonhuman Sapient" | "Beast / Monster";
  encounter: string;
  situation: string;
  reaction: string;
};

function pickBodyPart() {
  const types = Object.keys(monsterData.bodyParts) as (keyof typeof monsterData.bodyParts)[];
  const type = pick(types);
  return { type: type.charAt(0).toUpperCase() + type.slice(1), trait: pick(monsterData.bodyParts[type]) };
}

type StatCategory = "humans" | "spellcasters" | "animals" | "unnatural";
const statCategories: StatCategory[] = ["humans", "spellcasters", "animals", "unnatural"];

function pickStatLine(): { category: StatCategory; line: (typeof monsterData.statLines.animals)[0] } {
  const cat = pick(statCategories);
  const lines = monsterData.statLines[cat] as (typeof monsterData.statLines.animals);
  return { category: cat, line: pick(lines) };
}

function generateMonster(): MonsterResult {
  const bp1 = pickBodyPart();
  let bp2 = pickBodyPart();
  while (bp2.type === bp1.type) bp2 = pickBodyPart();
  const stat = pickStatLine();
  const isBlighted = Math.random() > 0.5;

  return {
    animalType: pick(monsterData.animalType),
    bodyPlan: pick(monsterData.bodyPlan),
    huntingMethod: pick(monsterData.huntingMethod),
    whyNotDead: pick(monsterData.whyNotDead),
    bodyPart1: bp1,
    bodyPart2: bp2,
    drive: pick(monsterData.monstrousDrives),
    isBlighted,
    blightedIntent: isBlighted ? pick(monsterData.blightedIntent) : "",
    blightedQuality: isBlighted ? pick(monsterData.blightedQualities) : "",
    howArose: pick(monsterData.context.howArose),
    pastConnection: pick(monsterData.context.connectionWithPast),
    localContact: pick(monsterData.context.localContact),
    localReaction: pick(monsterData.context.localReaction),
    scarsLeft: pick(monsterData.context.scarsLeft),
    twist: pick(monsterData.context.twists),
    statCategory: stat.category,
    statLine: stat.line,
  };
}

function generateEncounter(): EncounterResult {
  const d3 = Math.floor(Math.random() * 3);
  if (d3 === 0) {
    return {
      type: "Human",
      encounter: pick(monsterData.encounters.human),
      situation: pick(monsterData.encounters.sapientSituation),
      reaction: pick(monsterData.encounters.reactionRoll),
    };
  } else if (d3 === 1) {
    return {
      type: "Nonhuman Sapient",
      encounter: pick(monsterData.encounters.nonhumanSapient),
      situation: pick(monsterData.encounters.sapientSituation),
      reaction: pick(monsterData.encounters.reactionRoll),
    };
  } else {
    return {
      type: "Beast / Monster",
      encounter: pick(monsterData.encounters.beastsAndMonsters),
      situation: pick(monsterData.encounters.beastSituation),
      reaction: pick(monsterData.encounters.reactionRoll),
    };
  }
}

function monsterToText(m: MonsterResult): string {
  const lines = [
    "MONSTER",
    `Resembles: ${m.animalType}`,
    `Body plan: ${m.bodyPlan}`,
    `Hunts by: ${m.huntingMethod}`,
    `Survives because: ${m.whyNotDead}`,
    `Features: ${m.bodyPart1.type} — ${m.bodyPart1.trait}; ${m.bodyPart2.type} — ${m.bodyPart2.trait}`,
    "",
    `DRIVE: ${m.drive.name}`,
    m.drive.full,
    "",
    `Origin: ${m.howArose}`,
    `Past connection: ${m.pastConnection}`,
    `Local awareness: ${m.localContact}`,
    `Local reaction: ${m.localReaction}`,
    `Scars left: ${m.scarsLeft}`,
    `Twist: ${m.twist}`,
  ];
  if (m.isBlighted) {
    lines.push("", `BLIGHTED`, `Intent: ${m.blightedIntent}`, `Quality: ${m.blightedQuality}`);
  }
  const s = m.statLine;
  lines.push("", `STAT LINE (${m.statLine.name})`, `HD ${s.hd} / AC ${s.ac} / Atk ${s.atk} / Dmg ${s.dmg} / Shock ${s.shock} / Move ${s.move} / ML ${s.ml} / Inst ${s.inst} / Skill ${s.skill} / Save ${s.save}`);
  return lines.join("\n");
}

function encounterToText(e: EncounterResult): string {
  return [`ENCOUNTER (${e.type})`, e.encounter, `Situation: ${e.situation}`, `Reaction: ${e.reaction}`].join("\n");
}

function RF({ label, value, onReroll }: { label: string; value: string; onReroll: () => void }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-amber-400 font-semibold min-w-[9rem] shrink-0 text-sm">{label}</span>
      <span className="text-stone-200 text-sm flex-1">{value}</span>
      <button onClick={onReroll} className="text-stone-600 hover:text-amber-400 transition-colors shrink-0" title="Re-roll">↻</button>
    </div>
  );
}

type MMEncounterResult = {
  group: string;
  monster: typeof mmMonsters[0];
  situation: string;
  reaction: string;
};

type Tab = "monster" | "encounter" | "mm-encounter" | "instinct" | "lookup";
type Props = { onAdd: (label: string, text: string) => void };

export default function MonsterGenerator({ onAdd }: Props) {
  const [tab, setTab] = useState<Tab>("monster");
  const [monster, setMonster] = useState<MonsterResult | null>(null);
  const [encounter, setEncounter] = useState<EncounterResult | null>(null);
  const [instinctType, setInstinctType] = useState<string>("Ordinary Predatory Beast");
  const [instinctResult, setInstinctResult] = useState<string | null>(null);
  const [mmEncounter, setMmEncounter] = useState<MMEncounterResult | null>(null);

  function rollMMEncounter(groupKey?: keyof typeof mmEncounterGroups) {
    const keys = Object.keys(mmEncounterGroups) as (keyof typeof mmEncounterGroups)[];
    const key = groupKey ?? pick(keys);
    const names = mmEncounterGroups[key];
    const name = pick(names);
    const monster = mmMonsters.find(m => m.name === name) ?? mmMonsters[0];
    const isBeast = monster.intelligence.toLowerCase().includes('non') || monster.intelligence.toLowerCase().includes('animal');
    const situation = pick(isBeast ? monsterData.encounters.beastSituation : monsterData.encounters.sapientSituation);
    const reaction = pick(monsterData.encounters.reactionRoll);
    const result: MMEncounterResult = { group: key, monster, situation, reaction };
    setMmEncounter(result);
    onAdd(`MM Encounter: ${name}`, [
      `ENCOUNTER: ${name} (${key})`,
      `AC ${monster.ac} (1e AC ${monster.acOriginal}) | HD ${monster.hd} | Move ${monster.move}`,
      monster.attacks ? `Attacks: ${monster.attacks} | Dmg: ${monster.damage}` : '',
      `Situation: ${situation}`,
      `Reaction: ${reaction}`,
    ].filter(Boolean).join('\n'));
  }

  function generate() {
    const m = generateMonster();
    setMonster(m);
    onAdd(`Monster: ${m.drive.name} (${m.animalType.split(" ")[0]})`, monsterToText(m));
  }

  function reroll(updater: (prev: MonsterResult) => MonsterResult) {
    setMonster(prev => prev ? updater(prev) : prev);
  }

  function rollEncounter() {
    const e = generateEncounter();
    setEncounter(e);
    onAdd(`Encounter: ${e.encounter}`, encounterToText(e));
  }

  function rollInstinct() {
    const actions = monsterData.instinctActions[instinctType as keyof typeof monsterData.instinctActions];
    setInstinctResult(pick(actions));
  }

  const tabs = [
    { id: "monster" as Tab, label: "Builder" },
    { id: "encounter" as Tab, label: "Encounter" },
    { id: "mm-encounter" as Tab, label: "MM Encounter" },
    { id: "instinct" as Tab, label: "Instinct" },
    { id: "lookup" as Tab, label: "MM Lookup" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-stone-900 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${tab === t.id ? "bg-stone-600 text-stone-100" : "text-stone-400 hover:text-stone-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "monster" && (
        <div className="space-y-4">
          <button onClick={generate} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors">
            Generate Monster
          </button>

          {monster && (
            <div className="bg-stone-800 border border-stone-600 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-600 pb-3">
                <div>
                  <p className="text-amber-300 text-lg font-bold">{monster.drive.name}</p>
                  <p className="text-stone-400 text-sm">{monster.animalType}</p>
                </div>
                <CopyButton text={monsterToText(monster)} />
              </div>

              <div className="space-y-1.5">
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Form</p>
                <RF label="Resembles" value={monster.animalType} onReroll={() => reroll(p => ({...p, animalType: pick(monsterData.animalType)}))} />
                <RF label="Body plan" value={monster.bodyPlan} onReroll={() => reroll(p => ({...p, bodyPlan: pick(monsterData.bodyPlan)}))} />
                <RF label="Hunts by" value={monster.huntingMethod} onReroll={() => reroll(p => ({...p, huntingMethod: pick(monsterData.huntingMethod)}))} />
                <RF label="Survives because" value={monster.whyNotDead} onReroll={() => reroll(p => ({...p, whyNotDead: pick(monsterData.whyNotDead)}))} />
                <RF label={`Feature (${monster.bodyPart1.type})`} value={monster.bodyPart1.trait} onReroll={() => reroll(p => ({...p, bodyPart1: pickBodyPart()}))} />
                <RF label={`Feature (${monster.bodyPart2.type})`} value={monster.bodyPart2.trait} onReroll={() => reroll(p => ({...p, bodyPart2: pickBodyPart()}))} />
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Drive</p>
                <div className="flex gap-2 items-start">
                  <span className="text-amber-400 font-semibold min-w-[9rem] shrink-0 text-sm">Drive</span>
                  <div className="flex-1">
                    <p className="text-red-300 font-semibold text-sm">{monster.drive.name}</p>
                    <p className="text-stone-300 text-sm mt-0.5">{monster.drive.summary}</p>
                  </div>
                  <button onClick={() => reroll(p => ({...p, drive: pick(monsterData.monstrousDrives)}))} className="text-stone-600 hover:text-amber-400 transition-colors shrink-0" title="Re-roll">↻</button>
                </div>
              </div>

              {monster.isBlighted && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Blighted</p>
                  <RF label="Intent" value={monster.blightedIntent} onReroll={() => reroll(p => ({...p, blightedIntent: pick(monsterData.blightedIntent)}))} />
                  <RF label="Quality" value={monster.blightedQuality} onReroll={() => reroll(p => ({...p, blightedQuality: pick(monsterData.blightedQualities)}))} />
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Context</p>
                <RF label="Origin" value={monster.howArose} onReroll={() => reroll(p => ({...p, howArose: pick(monsterData.context.howArose)}))} />
                <RF label="Past connection" value={monster.pastConnection} onReroll={() => reroll(p => ({...p, pastConnection: pick(monsterData.context.connectionWithPast)}))} />
                <RF label="Local awareness" value={monster.localContact} onReroll={() => reroll(p => ({...p, localContact: pick(monsterData.context.localContact)}))} />
                <RF label="Local reaction" value={monster.localReaction} onReroll={() => reroll(p => ({...p, localReaction: pick(monsterData.context.localReaction)}))} />
                <RF label="Scars left" value={monster.scarsLeft} onReroll={() => reroll(p => ({...p, scarsLeft: pick(monsterData.context.scarsLeft)}))} />
                <RF label="Twist" value={monster.twist} onReroll={() => reroll(p => ({...p, twist: pick(monsterData.context.twists)}))} />
              </div>

              <div className="pt-1 border-t border-stone-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-stone-500 text-xs uppercase tracking-widest">Suggested Stat Line</p>
                  <button onClick={() => reroll(p => { const s = pickStatLine(); return {...p, statCategory: s.category, statLine: s.line}; })}
                    className="text-stone-600 hover:text-amber-400 text-xs transition-colors">↻ re-roll</button>
                </div>
                <p className="text-amber-300 text-sm font-semibold mb-1">{monster.statLine.name}</p>
                <div className="grid grid-cols-5 gap-x-4 gap-y-1 text-xs">
                  {[["HD", monster.statLine.hd], ["AC", monster.statLine.ac], ["Atk", monster.statLine.atk], ["Dmg", monster.statLine.dmg], ["Shock", monster.statLine.shock], ["Move", monster.statLine.move], ["ML", monster.statLine.ml], ["Inst", monster.statLine.inst], ["Skill", monster.statLine.skill], ["Save", monster.statLine.save]].map(([k, v]) => (
                    <div key={k}><span className="text-stone-500">{k} </span><span className="text-stone-200">{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "encounter" && (
        <div className="space-y-4">
          <button onClick={rollEncounter} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors">
            Roll Encounter
          </button>
          <div className="flex flex-wrap gap-2">
            {(["Human", "Nonhuman Sapient", "Beast / Monster"] as const).map(type => (
              <button key={type} onClick={() => {
                const e: EncounterResult = {
                  type,
                  encounter: pick(type === "Human" ? monsterData.encounters.human : type === "Nonhuman Sapient" ? monsterData.encounters.nonhumanSapient : monsterData.encounters.beastsAndMonsters),
                  situation: pick(type === "Beast / Monster" ? monsterData.encounters.beastSituation : monsterData.encounters.sapientSituation),
                  reaction: pick(monsterData.encounters.reactionRoll),
                };
                setEncounter(e);
                onAdd(`Encounter: ${e.encounter}`, encounterToText(e));
              }} className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm rounded transition-colors">
                {type}
              </button>
            ))}
          </div>

          {encounter && (
            <div className="bg-stone-800 border border-stone-600 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-600 pb-3">
                <span className="text-stone-400 text-xs uppercase tracking-widest">{encounter.type}</span>
                <CopyButton text={encounterToText(encounter)} />
              </div>
              <p className="text-amber-300 font-semibold">{encounter.encounter}</p>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-stone-400 text-sm min-w-[7rem] shrink-0">Situation</span>
                  <span className="text-stone-200 text-sm">{encounter.situation}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-stone-400 text-sm min-w-[7rem] shrink-0">Reaction</span>
                  <span className="text-stone-200 text-sm">{encounter.reaction}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "mm-encounter" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => rollMMEncounter()} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors">
              Roll MM Encounter
            </button>
            {(["dungeon","wilderness","aquatic","undead","extraplanar"] as const).map(g => (
              <button key={g} onClick={() => rollMMEncounter(g)}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm rounded capitalize transition-colors">
                {g}
              </button>
            ))}
          </div>

          {mmEncounter && (
            <div className="bg-stone-800 border border-stone-600 rounded-lg p-5 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-stone-700 pb-3">
                <div>
                  <p className="text-amber-300 font-bold text-lg">{mmEncounter.monster.name}</p>
                  <p className="text-stone-500 text-xs capitalize">
                    {mmEncounter.group}
                    {mmEncounter.monster.frequency ? ` · ${mmEncounter.monster.frequency}` : ''}
                    {mmEncounter.monster.alignment ? ` · ${mmEncounter.monster.alignment}` : ''}
                  </p>
                </div>
                <CopyButton text={[
                  mmEncounter.monster.name,
                  `AC ${mmEncounter.monster.ac} (1e AC ${mmEncounter.monster.acOriginal}) | HD ${mmEncounter.monster.hd} | Move ${mmEncounter.monster.move}`,
                  mmEncounter.monster.attacks ? `Attacks: ${mmEncounter.monster.attacks} | Dmg: ${mmEncounter.monster.damage}` : '',
                  `Situation: ${mmEncounter.situation}`,
                  `Reaction: ${mmEncounter.reaction}`,
                ].filter(Boolean).join('\n')} />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ['AC (WWN)', mmEncounter.monster.ac],
                  ['AC (1e)', mmEncounter.monster.acOriginal],
                  ['HD', mmEncounter.monster.hd],
                  ['Move', mmEncounter.monster.move],
                  ['Attacks', mmEncounter.monster.attacks],
                  ['Damage', mmEncounter.monster.damage],
                ].filter(([,v]) => v).map(([k, v]) => (
                  <div key={String(k)} className="flex flex-col items-center bg-stone-700 rounded px-2 py-1 min-w-[3rem]">
                    <span className="text-stone-400 text-xs">{k}</span>
                    <span className="text-stone-100 text-sm font-bold">{v}</span>
                  </div>
                ))}
              </div>

              {mmEncounter.monster.specialAttacks && mmEncounter.monster.specialAttacks !== 'Nil' && (
                <p className="text-sm"><span className="text-red-400 text-xs font-bold uppercase">Special Attacks </span><span className="text-stone-300">{mmEncounter.monster.specialAttacks}</span></p>
              )}
              {mmEncounter.monster.specialDefenses && mmEncounter.monster.specialDefenses !== 'Nil' && (
                <p className="text-sm"><span className="text-blue-400 text-xs font-bold uppercase">Special Defenses </span><span className="text-stone-300">{mmEncounter.monster.specialDefenses}</span></p>
              )}

              <div className="border-t border-stone-700 pt-3 space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-stone-400 text-sm min-w-[6rem]">Situation</span>
                  <span className="text-stone-200 text-sm">{mmEncounter.situation}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-stone-400 text-sm min-w-[6rem]">Reaction</span>
                  <span className="text-stone-200 text-sm">{mmEncounter.reaction}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "lookup" && <MonsterLookup />}

      {tab === "instinct" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-stone-400 text-xs uppercase tracking-widest">Creature type</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(monsterData.instinctActions).map(type => (
                <button key={type} onClick={() => setInstinctType(type)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${instinctType === type ? "bg-amber-700 text-stone-100" : "bg-stone-700 hover:bg-stone-600 text-stone-300"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <button onClick={rollInstinct} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors">
            Roll Instinct Action
          </button>
          {instinctResult && (
            <div className="bg-stone-800 border border-stone-600 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-stone-200">{instinctResult}</p>
              <CopyButton text={`Instinct (${instinctType}): ${instinctResult}`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
