"use client";
import { useState } from "react";
import { npcData } from "@/data/npc";
import { pick } from "@/data/utils";
import CopyButton from "./CopyButton";

type NPCResult = {
  role: string;
  socialClass: string;
  twist: string;
  build: string;
  movement: string;
  clothing: string;
  firstImpression: string;
  differsFrom: string;
  mannerism: string;
  ambitionForm: string;
  ambitionObstacle: string;
  tragedyForm: string | null;
  tragedyScar: string | null;
};

function makeNPC(): NPCResult {
  const socialClass = pick(["underclass", "commoners", "gentry"] as const);
  return {
    socialClass,
    role: pick(npcData.npcClasses[socialClass]),
    twist: pick(npcData.characteristicTwists),
    build: pick(npcData.appearance.physicalBuild),
    movement: pick(npcData.appearance.wayTheyMove),
    clothing: pick(npcData.appearance.clothingIdiosyncrasies),
    firstImpression: pick(npcData.appearance.firstThingNoticed),
    differsFrom: pick(npcData.appearance.differFromExpectations),
    mannerism: pick(npcData.appearance.mannerisms),
    ambitionForm: pick(npcData.burningAmbition.basicForm),
    ambitionObstacle: pick(npcData.burningAmbition.biggestObstacle),
    tragedyForm: Math.random() > 0.5 ? pick(npcData.personalTragedy.basicForm) : null,
    tragedyScar: Math.random() > 0.5 ? pick(npcData.personalTragedy.scars) : null,
  };
}

function npcToText(n: NPCResult): string {
  const lines = [
    `NPC: ${n.role} (${n.socialClass})`,
    "",
    "APPEARANCE",
    `Build: ${n.build}`,
    `Movement: ${n.movement}`,
    `Clothing: ${n.clothing}`,
    `First noticed: ${n.firstImpression}`,
    `Stands out: ${n.differsFrom}`,
    `Mannerism: ${n.mannerism}`,
    "",
    "CHARACTER",
    `Twist: ${n.twist}`,
    `Ambition: ${n.ambitionForm}`,
    `Obstacle: ${n.ambitionObstacle}`,
  ];
  if (n.tragedyForm) lines.push(`Past tragedy: ${n.tragedyForm}`);
  if (n.tragedyScar) lines.push(`Scar from it: ${n.tragedyScar}`);
  return lines.join("\n");
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

type Props = { onAdd: (label: string, text: string) => void };

export default function NPCGenerator({ onAdd }: Props) {
  const [npc, setNpc] = useState<NPCResult | null>(null);
  const [specificType, setSpecificType] = useState<string | null>(null);

  function generate() {
    const n = makeNPC();
    setNpc(n);
    setSpecificType(null);
    onAdd(`NPC: ${n.role}`, npcToText(n));
  }

  function generateSpecific(type: keyof typeof npcData.specificTypes) {
    const n = { ...makeNPC(), role: pick(npcData.specificTypes[type]), socialClass: type as unknown as NPCResult["socialClass"] };
    setNpc(n);
    setSpecificType(null);
    onAdd(`${type}: ${n.role}`, npcToText(n));
  }

  function reroll(updater: (prev: NPCResult) => NPCResult) {
    setNpc(prev => prev ? updater(prev) : prev);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={generate} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors">
          Generate NPC
        </button>
        <span className="text-stone-500 self-center text-sm">or by type:</span>
        {(["criminals", "merchants", "nobility", "tribals", "villagers", "warriors"] as const).map(t => (
          <button key={t} onClick={() => generateSpecific(t)}
            className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm rounded capitalize transition-colors">
            {t}
          </button>
        ))}
      </div>

      {specificType && (
        <div className="bg-stone-800 border border-stone-600 rounded-lg p-4 flex items-center justify-between gap-3">
          <p className="text-stone-200">{specificType}</p>
          <CopyButton text={specificType} />
        </div>
      )}

      {npc && (
        <div className="bg-stone-800 border border-stone-600 rounded-lg p-5 space-y-3">
          <div className="flex items-start justify-between border-b border-stone-600 pb-3 mb-1">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-amber-300 text-xl font-bold">{npc.role}</p>
                <button onClick={() => reroll(p => {
                  const classKey = p.socialClass as keyof typeof npcData.npcClasses;
                  if (classKey in npcData.npcClasses) {
                    return {...p, role: pick(npcData.npcClasses[classKey])};
                  }
                  const specificKey = p.socialClass as keyof typeof npcData.specificTypes;
                  if (specificKey in npcData.specificTypes) {
                    return {...p, role: pick(npcData.specificTypes[specificKey])};
                  }
                  const cls = pick(["underclass","commoners","gentry"] as const);
                  return {...p, socialClass: cls, role: pick(npcData.npcClasses[cls])};
                })} className="text-stone-600 hover:text-amber-400 transition-colors" title="Re-roll role">↻</button>
              </div>
              <p className="text-stone-400 text-sm capitalize">{npc.socialClass}</p>
            </div>
            <CopyButton text={npcToText(npc)} />
          </div>

          <div className="space-y-1.5">
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Appearance</p>
            <RF label="Build" value={npc.build} onReroll={() => reroll(p => ({...p, build: pick(npcData.appearance.physicalBuild)}))} />
            <RF label="Movement" value={npc.movement} onReroll={() => reroll(p => ({...p, movement: pick(npcData.appearance.wayTheyMove)}))} />
            <RF label="Clothing" value={npc.clothing} onReroll={() => reroll(p => ({...p, clothing: pick(npcData.appearance.clothingIdiosyncrasies)}))} />
            <RF label="First noticed" value={npc.firstImpression} onReroll={() => reroll(p => ({...p, firstImpression: pick(npcData.appearance.firstThingNoticed)}))} />
            <RF label="Stands out" value={npc.differsFrom} onReroll={() => reroll(p => ({...p, differsFrom: pick(npcData.appearance.differFromExpectations)}))} />
            <RF label="Mannerism" value={npc.mannerism} onReroll={() => reroll(p => ({...p, mannerism: pick(npcData.appearance.mannerisms)}))} />
          </div>

          <div className="space-y-1.5 pt-2">
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Character</p>
            <RF label="Twist" value={npc.twist} onReroll={() => reroll(p => ({...p, twist: pick(npcData.characteristicTwists)}))} />
            <RF label="Ambition" value={npc.ambitionForm} onReroll={() => reroll(p => ({...p, ambitionForm: pick(npcData.burningAmbition.basicForm)}))} />
            <RF label="Obstacle" value={npc.ambitionObstacle} onReroll={() => reroll(p => ({...p, ambitionObstacle: pick(npcData.burningAmbition.biggestObstacle)}))} />

            {npc.tragedyForm !== null ? (
              <RF label="Past tragedy" value={npc.tragedyForm} onReroll={() => reroll(p => ({...p, tragedyForm: pick(npcData.personalTragedy.basicForm)}))} />
            ) : (
              <button onClick={() => reroll(p => ({...p, tragedyForm: pick(npcData.personalTragedy.basicForm)}))}
                className="text-stone-600 hover:text-stone-400 text-xs transition-colors">+ Add tragedy</button>
            )}

            {npc.tragedyForm !== null && (
              npc.tragedyScar !== null ? (
                <RF label="Scar from it" value={npc.tragedyScar} onReroll={() => reroll(p => ({...p, tragedyScar: pick(npcData.personalTragedy.scars)}))} />
              ) : (
                <button onClick={() => reroll(p => ({...p, tragedyScar: pick(npcData.personalTragedy.scars)}))}
                  className="text-stone-600 hover:text-stone-400 text-xs transition-colors ml-36">+ Add scar</button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
