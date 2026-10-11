import { derbiCylinders, derbiDefaultPartsByGoal, derbiPartCatalog, derbiSpecialCrankByCylinder } from "./derbiCatalog";
import {
  categoryLabels,
  categoryOrder,
  cylinders,
  defaultPartsByGoal,
  goalsByTier,
  partCatalog,
  type CylinderOption,
  type PartCategory,
  type PartOption,
  type SetupEngine,
} from "./setupCatalog";

const derbiExhaustByCylinder: Record<string, string> = {
  "derbi-2fast70": "derbi-2fast70-exhaust",
  "derbi-streetrace88": "derbi-yasuni-r3",
  "derbi-bigracing88": "derbi-yasuni-r3",
  "derbi-mvt-iron90": "derbi-rt-exhaust90",
  "derbi-rt95": "derbi-rt-exhaust90",
  "derbi-bidalot90": "derbi-rt-exhaust90",
  "derbi-2fast100": "derbi-rt-exhaust90",
};

export type SetupRecommendation = {
  engine: SetupEngine;
  goal: string;
  cylinder: CylinderOption;
  parts: PartOption[];
  totalEur: number;
};

export function getCompatibleCylinders(engine: SetupEngine) {
  const source = engine === "Minarelli AM6" ? cylinders : derbiCylinders;
  return source.filter((cylinder) => !cylinder.compatibleEngines || cylinder.compatibleEngines.includes(engine));
}

export function recommendSetup(engine: SetupEngine, cylinderId: string): SetupRecommendation | null {
  const cylinder = getCompatibleCylinders(engine).find((item) => item.id === cylinderId);
  if (!cylinder) return null;
  const isDerbi = engine !== "Minarelli AM6";
  const catalog = isDerbi ? derbiPartCatalog : partCatalog;
  const goal = goalsByTier[cylinder.tier];
  const selected = { ...(isDerbi ? derbiDefaultPartsByGoal[goal] : defaultPartsByGoal[goal]) } as Record<PartCategory, string>;
  const crankshaft = cylinder.recommendedCrankshaft ?? (isDerbi ? derbiSpecialCrankByCylinder[cylinder.id] : undefined);
  const exhaust = cylinder.recommendedExhaust ?? (isDerbi ? derbiExhaustByCylinder[cylinder.id] : undefined);
  if (crankshaft) selected.crankshaft = crankshaft;
  if (cylinder.recommendedBearings) selected.bearings = cylinder.recommendedBearings;
  if (exhaust) selected.exhaust = exhaust;

  const parts = categoryOrder.map((category) => catalog[category].find((part) => part.id === selected[category]) ?? catalog[category][0]);
  return {
    engine,
    goal,
    cylinder,
    parts,
    totalEur: cylinder.priceEur + parts.reduce((sum, part) => sum + part.priceEur, 0),
  };
}

export function getPartLabel(category: PartCategory) {
  return categoryLabels[category].title;
}

export { categoryOrder };