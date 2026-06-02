"use client";
import { useState } from "react";
import { dungeonData, ruinTags, ruinTagDetails } from "@/data/dungeon";
import { treasureData } from "@/data/treasure";
import { pick } from "@/data/utils";
import CopyButton from "./CopyButton";

type RuinResult = {
  age: string;
  kind: string;
  localsThink: string;
  howRuined: string;
  whyNotPlundered: string;
  previousUsers: string;
  inhabitantStructure: string;
  whyTheyCame: string;
  whyStaying: string;
  tags: [string, string];
};

type RoomResult = {
  function: string;
  specific: string;
  hasTreasure: boolean;
  treasureLocation?: string;
  contentType: "Creature" | "Hazard" | "Enigma" | "Distractor" | "Empty";
  content?: string;
  combatHappening?: string;
  combatTwist?: string;
};

type TreasureResult = {
  siteType: string;
  diceRoll: number;
  valueColumn: string;
  magicItemCount: number;
  magicItemTypes: string[];
  valuableItem: string;
  whyValuable: string;
  jewelry: string;
};

function rollDice(sides: number, count = 1): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
  return total;
}

function generateRuin(): RuinResult {
  const siteKey = pick(Object.keys(dungeonData.siteTypes) as (keyof typeof dungeonData.siteTypes)[]);
  const siteList = dungeonData.siteTypes[siteKey];

  // Pick 2 unique tags
  const shuffled = [...ruinTags].sort(() => Math.random() - 0.5);
  const tags: [string, string] = [shuffled[0], shuffled[1]];

  return {
    age: pick(dungeonData.ruinGeneration.age),
    kind: pick(siteList),
    localsThink: pick(dungeonData.ruinGeneration.localsThink),
    howRuined: pick(dungeonData.ruinGeneration.howRuined),
    whyNotPlundered: pick(dungeonData.ruinGeneration.whyNotPlundered),
    previousUsers: pick(dungeonData.ruinGeneration.previousUsers),
    inhabitantStructure: pick(dungeonData.inhabitants.structureTypes),
    whyTheyCame: pick(dungeonData.inhabitants.whyTheyCame),
    whyStaying: pick(dungeonData.inhabitants.whyStaying),
    tags,
  };
}

function generateRoom(): RoomResult {
  const d8 = rollDice(8);
  const d6 = rollDice(6);

  let contentType: RoomResult["contentType"];
  let hasTreasure: boolean;

  if (d8 <= 2) { contentType = "Creature"; hasTreasure = d6 <= 3; }
  else if (d8 === 3) { contentType = "Hazard"; hasTreasure = d6 <= 2; }
  else if (d8 === 4) { contentType = "Enigma"; hasTreasure = d6 <= 2; }
  else if (d8 <= 6) { contentType = "Distractor"; hasTreasure = d6 === 1; }
  else { contentType = "Empty"; hasTreasure = d6 === 1; }

  const funcKey = pick(Object.keys(dungeonData.rooms).filter(k => k !== "basicFunction") as (keyof typeof dungeonData.rooms)[]);
  const funcRooms = dungeonData.rooms[funcKey] as string[];
  const funcLabel = funcKey === "workRoom" ? "Work Room"
    : funcKey === "residential" ? "Residential"
    : funcKey === "cultural" ? "Cultural"
    : funcKey === "martial" ? "Martial"
    : funcKey === "religious" ? "Religious"
    : "Utility";

  let content: string | undefined;
  if (contentType === "Hazard") content = pick(dungeonData.roomContents.hazards);
  else if (contentType === "Enigma") content = pick(dungeonData.roomContents.enigmas);
  else if (contentType === "Distractor") content = pick(dungeonData.roomContents.distractors);

  return {
    function: funcLabel,
    specific: pick(funcRooms),
    hasTreasure,
    treasureLocation: hasTreasure ? pick(dungeonData.roomContents.treasureLocations) : undefined,
    contentType,
    content,
    combatHappening: contentType === "Creature" ? pick(dungeonData.encounters.combatComplications.whatsHappening) : undefined,
    combatTwist: contentType === "Creature" && Math.random() > 0.5 ? pick(dungeonData.encounters.combatComplications.twists) : undefined,
  };
}

function rollMagicItemCount(d20: number, label: string): number {
  const row = treasureData.magicItemChance.find(r => r.label === label);
  if (!row) return 0;
  if (row.threePlus && d20 >= row.threePlus[0]) return rollDice(3) + 1;
  if (row.twoItems && d20 >= row.twoItems[0]) return 2;
  if (row.oneItem && d20 >= row.oneItem[0]) return 1;
  return 0;
}

function rollMagicItemType(): string {
  const d20 = rollDice(20);
  const entry = treasureData.magicItemTypes.find(e => d20 >= e.range[0] && d20 <= e.range[1]);
  return entry?.type ?? "Device";
}

function generateTreasure(): TreasureResult {
  const siteEntry = pick(treasureData.siteValues);
  const diceRoll = rollDice(6, 2); // 2d6
  let colIndex: number;
  if (diceRoll <= 3) colIndex = 0;
  else if (diceRoll <= 5) colIndex = 1;
  else if (diceRoll <= 8) colIndex = 2;
  else if (diceRoll <= 10) colIndex = 3;
  else colIndex = 4;

  const troveLabel = pick(treasureData.magicItemChance).label;
  const d20 = rollDice(20);
  const magicCount = rollMagicItemCount(d20, troveLabel);
  const magicTypes = Array.from({ length: magicCount }, rollMagicItemType);

  return {
    siteType: siteEntry.label,
    diceRoll,
    valueColumn: siteEntry.cols[colIndex],
    magicItemCount: magicCount,
    magicItemTypes: magicTypes,
    valuableItem: pick(treasureData.valuableObjects),
    whyValuable: pick(treasureData.whyValuable),
    jewelry: pick(treasureData.jewelryTypes),
  };
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

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-amber-400 font-semibold min-w-[9rem] shrink-0 text-sm">{label}</span>
      <span className="text-stone-200 text-sm">{value}</span>
    </div>
  );
}

const contentColors: Record<string, string> = {
  Creature: "text-red-400",
  Hazard: "text-orange-400",
  Enigma: "text-purple-400",
  Distractor: "text-blue-400",
  Empty: "text-stone-500",
};

function ruinToText(r: RuinResult): string {
  return [
    `RUIN: ${r.kind}`,
    "",
    `Age: ${r.age}`,
    `How ruined: ${r.howRuined}`,
    `Locals think: ${r.localsThink}`,
    `Why not looted: ${r.whyNotPlundered}`,
    `Previously used by: ${r.previousUsers}`,
    "",
    "INHABITANTS",
    `Structure: ${r.inhabitantStructure}`,
    `Why came: ${r.whyTheyCame}`,
    `Why staying: ${r.whyStaying}`,
    "",
    `TAGS: ${r.tags[0]}, ${r.tags[1]}`,
  ].join("\n");
}

type DungeonTab = "ruin" | "rooms" | "treasure";
type Props = { onAdd: (label: string, text: string) => void };

export default function DungeonGenerator({ onAdd }: Props) {
  const [activeTab, setActiveTab] = useState<DungeonTab>("ruin");
  const [ruin, setRuin] = useState<RuinResult | null>(null);
  const [expandedTag, setExpandedTag] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomResult[]>([]);
  const [treasure, setTreasure] = useState<TreasureResult | null>(null);
  const [dungeonEvent, setDungeonEvent] = useState<string | null>(null);

  function generateRuinResult() {
    const r = generateRuin();
    setRuin(r);
    setExpandedTag(null);
    onAdd(`Ruin: ${r.kind}`, ruinToText(r));
  }

  function rerollRuin(updater: (prev: RuinResult) => RuinResult) {
    setRuin(prev => prev ? updater(prev) : prev);
  }

  const allSiteOptions = Object.values(dungeonData.siteTypes).flat();

  function addRoom() {
    setRooms((prev) => [...prev, generateRoom()]);
  }

  const tabs: { id: DungeonTab; label: string }[] = [
    { id: "ruin", label: "Ruin" },
    { id: "rooms", label: "Rooms" },
    { id: "treasure", label: "Treasure" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-stone-900 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-stone-600 text-stone-100"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "ruin" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generateRuinResult}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors"
            >
              Generate Ruin
            </button>
          </div>

          {ruin && (
            <div className="space-y-4">
              <div className="bg-stone-800 border border-stone-600 rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-stone-400 text-xs uppercase tracking-widest">Overview</p>
                  <CopyButton text={ruinToText(ruin)} />
                </div>
                <RF label="Type" value={ruin.kind} onReroll={() => rerollRuin(p => ({...p, kind: pick(allSiteOptions)}))} />
                <RF label="Age" value={ruin.age} onReroll={() => rerollRuin(p => ({...p, age: pick(dungeonData.ruinGeneration.age)}))} />
                <RF label="How ruined" value={ruin.howRuined} onReroll={() => rerollRuin(p => ({...p, howRuined: pick(dungeonData.ruinGeneration.howRuined)}))} />
                <RF label="Locals think" value={ruin.localsThink} onReroll={() => rerollRuin(p => ({...p, localsThink: pick(dungeonData.ruinGeneration.localsThink)}))} />
                <RF label="Why not looted" value={ruin.whyNotPlundered} onReroll={() => rerollRuin(p => ({...p, whyNotPlundered: pick(dungeonData.ruinGeneration.whyNotPlundered)}))} />
                <RF label="Previously used" value={ruin.previousUsers} onReroll={() => rerollRuin(p => ({...p, previousUsers: pick(dungeonData.ruinGeneration.previousUsers)}))} />
                <div className="pt-2 border-t border-stone-700 mt-2">
                  <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Inhabitants</p>
                  <RF label="Structure" value={ruin.inhabitantStructure} onReroll={() => rerollRuin(p => ({...p, inhabitantStructure: pick(dungeonData.inhabitants.structureTypes)}))} />
                  <RF label="Why came" value={ruin.whyTheyCame} onReroll={() => rerollRuin(p => ({...p, whyTheyCame: pick(dungeonData.inhabitants.whyTheyCame)}))} />
                  <RF label="Why staying" value={ruin.whyStaying} onReroll={() => rerollRuin(p => ({...p, whyStaying: pick(dungeonData.inhabitants.whyStaying)}))} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-stone-400 text-xs uppercase tracking-widest">Ruin Tags</p>
                  <button
                    onClick={() => rerollRuin(p => { const s = [...ruinTags].sort(() => Math.random() - 0.5); return {...p, tags: [s[0], s[1]]}; })}
                    className="text-stone-600 hover:text-amber-400 text-xs transition-colors"
                  >↻ re-roll tags</button>
                </div>
                {ruin.tags.map((tag) => {
                  const details = ruinTagDetails[tag];
                  const isOpen = expandedTag === tag;
                  return (
                    <div key={tag} className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedTag(isOpen ? null : tag)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-750 transition-colors"
                      >
                        <span className="text-amber-300 font-semibold">{tag}</span>
                        <span className="text-stone-500 text-sm">{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && details && (
                        <div className="px-4 pb-4 space-y-2 border-t border-stone-700 pt-3">
                          <div><span className="text-red-400 text-xs font-bold uppercase">Enemies</span><p className="text-stone-300 text-sm mt-0.5">{details.enemies}</p></div>
                          <div><span className="text-green-400 text-xs font-bold uppercase">Friends</span><p className="text-stone-300 text-sm mt-0.5">{details.friends}</p></div>
                          <div><span className="text-yellow-400 text-xs font-bold uppercase">Complications</span><p className="text-stone-300 text-sm mt-0.5">{details.complications}</p></div>
                          <div><span className="text-amber-400 text-xs font-bold uppercase">Treasure</span><p className="text-stone-300 text-sm mt-0.5">{details.treasure}</p></div>
                          <div><span className="text-blue-400 text-xs font-bold uppercase">Places</span><p className="text-stone-300 text-sm mt-0.5">{details.places}</p></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "rooms" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={addRoom}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors"
            >
              + Generate Room
            </button>
            <button
              onClick={() => setDungeonEvent(pick(dungeonData.encounters.dungeonEvents))}
              className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded transition-colors"
            >
              Dungeon Event
            </button>
            {rooms.length > 0 && (
              <button
                onClick={() => setRooms([])}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-400 rounded transition-colors text-sm"
              >
                Clear All
              </button>
            )}
          </div>

          {dungeonEvent && (
            <div className="bg-stone-800 border border-purple-800 rounded-lg px-4 py-3">
              <span className="text-purple-400 text-xs uppercase tracking-widest block mb-1">Dungeon Event</span>
              <p className="text-stone-200">{dungeonEvent}</p>
            </div>
          )}

          {rooms.length > 0 && (
            <div className="space-y-3">
              <p className="text-stone-400 text-xs uppercase tracking-widest">Rooms ({rooms.length})</p>
              {rooms.map((room, i) => (
                <div key={i} className="bg-stone-800 border border-stone-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-stone-400 text-xs">Room {i + 1} · {room.function}</span>
                      <p className="text-stone-200 font-medium">{room.specific}</p>
                    </div>
                    <span className={`text-sm font-semibold ${contentColors[room.contentType]}`}>
                      {room.contentType}
                    </span>
                  </div>

                  {room.content && (
                    <p className="text-stone-300 text-sm">{room.content}</p>
                  )}

                  {room.contentType === "Creature" && room.combatHappening && (
                    <div className="text-sm space-y-0.5">
                      <span className="text-stone-400 text-xs">When found: </span>
                      <span className="text-stone-300">{room.combatHappening}</span>
                      {room.combatTwist && (
                        <p><span className="text-stone-400 text-xs">Twist: </span><span className="text-stone-300">{room.combatTwist}</span></p>
                      )}
                    </div>
                  )}

                  {room.hasTreasure && room.treasureLocation && (
                    <div className="text-sm">
                      <span className="text-amber-500 text-xs">Treasure: </span>
                      <span className="text-stone-300">{room.treasureLocation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "treasure" && (
        <div className="space-y-4">
          <button
            onClick={() => setTreasure(generateTreasure())}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors"
          >
            Generate Treasure
          </button>

          {treasure && (
            <div className="bg-stone-800 border border-stone-600 rounded-lg p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-stone-400 text-xs uppercase tracking-widest">Site Value</p>
                  <CopyButton text={[
                    `Site: ${treasure.siteType}`,
                    `Value: ${treasure.valueColumn} sp (rolled ${treasure.diceRoll} on 2d6)`,
                    treasure.magicItemCount > 0 ? `Magic items: ${treasure.magicItemTypes.join(", ")}` : "No magic items",
                    `Goods: ${treasure.valuableItem}`,
                    `Notable because: ${treasure.whyValuable}`,
                    `Jewelry: ${treasure.jewelry}`,
                  ].join("\n")} /></div>
                <Section label="Site type" value={treasure.siteType} />
                <div className="flex gap-2">
                  <span className="text-amber-400 font-semibold min-w-[10rem] shrink-0">2d6 roll</span>
                  <span className="text-stone-200">{treasure.diceRoll} → <span className="text-amber-300 font-bold">{treasure.valueColumn} sp</span></span>
                </div>
              </div>

              <div className="space-y-2 border-t border-stone-700 pt-3">
                <p className="text-stone-400 text-xs uppercase tracking-widest">Magic Items</p>
                {treasure.magicItemCount === 0 ? (
                  <p className="text-stone-500 text-sm">No magic items in this trove</p>
                ) : (
                  <>
                    <p className="text-stone-300 text-sm">{treasure.magicItemCount} magic item{treasure.magicItemCount > 1 ? "s" : ""} found:</p>
                    {treasure.magicItemTypes.map((t, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-amber-400 text-sm min-w-[4rem]">Item {i + 1}</span>
                        <span className="text-purple-300 text-sm font-medium">{t}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="space-y-2 border-t border-stone-700 pt-3">
                <p className="text-stone-400 text-xs uppercase tracking-widest">Valuables</p>
                <Section label="Goods found" value={treasure.valuableItem} />
                <Section label="Why notable" value={treasure.whyValuable} />
                <Section label="Jewelry type" value={treasure.jewelry} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
