"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export type PortKey = "wydech" | "transfer" | "boost";
export type PortMillingPlan = { targetRoof: number; cutDepth: number };
type ModelPortSetup = {
  roofHeight: number;
  portHeight: number;
  chordAtRoof: number;
  chordAtBottom: number;
  chordAtTarget: number;
  count: number;
  angularSpacing: number;
};

type CylinderModelProps = {
  modelName: string;
  bore: number;
  portKey: PortKey;
  portLabel: string;
  portLayouts: Record<PortKey, ModelPortSetup>;
  portPlans: Record<PortKey, PortMillingPlan>;
  roofHeight: number;
  targetRoof: number;
  portHeight: number;
  currentChord: number;
  bottomChord: number;
  targetChord: number;
  count: number;
  angularSpacing: number;
  cutaway: boolean;
  coolingType: "air" | "liquid";
  totalHeight: number;
  jacketDiameter: number;
  spigotDiameter: number;
  exhaustDuctDiameter: number;
  studDiagonal: number;
  studCount: number;
};

type PortHoverData = {
  key: PortKey;
  label: string;
  position: string;
  selected: boolean;
  roofHeight: number;
  targetRoof: number;
  cutDepth: number;
  currentChord: number;
  targetChord: number;
};

type PortHoverState = PortHoverData & { x: number; y: number };

function createDeckRing(boreRadius: number, deckY: number, jacketRadius: number, studs: Array<{ x: number; z: number }>) {
  const shape = new THREE.Shape();
  const baseRadius = jacketRadius + 1.1;
  const bossRadius = Math.max(5.8, Math.min(8, boreRadius * 0.14));
  const segments = 256;
  for (let index = 0; index <= segments; index += 1) {
    const angle = index / segments * Math.PI * 2;
    let radius = baseRadius;
    for (const stud of studs) {
      const studAngle = Math.atan2(stud.z, stud.x);
      const delta = Math.atan2(Math.sin(angle - studAngle), Math.cos(angle - studAngle));
      const centerRadius = Math.hypot(stud.x, stud.z);
      const amplitude = Math.max(0, centerRadius + bossRadius - baseRadius);
      radius = Math.max(radius, baseRadius + amplitude * Math.exp(-(delta * delta) / (2 * 0.19 ** 2)));
    }
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const boreHole = new THREE.Path();
  boreHole.absarc(0, 0, boreRadius + 0.9, 0, Math.PI * 2, true);
  shape.holes.push(boreHole);
  const boltHoleRadius = Math.max(2.2, Math.min(3.1, boreRadius * 0.052));
  for (const stud of studs) {
    const boltHole = new THREE.Path();
    boltHole.absarc(stud.x, stud.z, boltHoleRadius, 0, Math.PI * 2, true);
    shape.holes.push(boltHole);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1.8, bevelEnabled: false, curveSegments: 64 });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, deckY - 0.9, 0);
  return geometry;
}

function createOuterCylinder(radius: number, centerY: number, height: number, cutaway: boolean, exhaustCenterY: number, exhaustRadius: number) {
  const columns = cutaway ? 192 : 144;
  const rows = Math.max(96, Math.ceil(height * 1.5));
  const phiStart = cutaway ? Math.PI / 2 : 0;
  const phiLength = cutaway ? Math.PI : Math.PI * 2;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const y = centerY + height / 2 - height * row / rows;
    const vertical = 1 - row / rows;
    const edgeRound = 0.955 + 0.045 * Math.sin(Math.PI * vertical);
    const rowRadius = radius * edgeRound;
    for (let column = 0; column <= columns; column += 1) {
      const phi = phiStart + phiLength * column / columns;
      positions.push(rowRadius * Math.sin(phi), y, rowRadius * Math.cos(phi));
    }
  }

  for (let row = 0; row < rows; row += 1) {
    const y = centerY + height / 2 - height * (row + 0.5) / rows;
    const vertical = 1 - (row + 0.5) / rows;
    const rowRadius = radius * (0.955 + 0.045 * Math.sin(Math.PI * vertical));
    for (let column = 0; column < columns; column += 1) {
      const phi = phiStart + phiLength * (column + 0.5) / columns;
      const x = rowRadius * Math.sin(phi);
      const isRoundExhaustOpening = Math.cos(phi) < -0.65
        && x * x + (y - exhaustCenterY) ** 2 < exhaustRadius ** 2;
      if (isRoundExhaustOpening) continue;
      const start = row * (columns + 1) + column;
      const next = start + columns + 1;
      indices.push(start, next, start + 1, start + 1, next, next + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createAnnularFlange(innerRadius: number, outerRadius: number, thickness: number) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 40 });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

function createPortOutline(
  boreRadius: number,
  centerAngle: number,
  roofTop: number,
  roofBottom: number,
  chordTop: number,
  chordBottom: number,
  deckY: number,
  radiusOffset: number,
) {
  const points: THREE.Vector3[] = [];
  const segments = 28;
  const surfaceRadius = boreRadius + radiusOffset;
  const pointAt = (angle: number, y: number) => new THREE.Vector3(surfaceRadius * Math.sin(angle), y, -surfaceRadius * Math.cos(angle));
  const halfTop = Math.asin(Math.max(-1, Math.min(1, chordTop / (2 * boreRadius))));
  const halfBottom = Math.asin(Math.max(-1, Math.min(1, chordBottom / (2 * boreRadius))));

  for (let step = 0; step <= segments; step += 1) {
    const fraction = step / segments;
    points.push(pointAt(centerAngle + (fraction * 2 - 1) * halfTop, deckY - roofTop));
  }
  for (let step = 1; step <= 12; step += 1) {
    const fraction = step / 12;
    const half = halfTop + (halfBottom - halfTop) * fraction;
    points.push(pointAt(centerAngle + half, deckY - (roofTop + (roofBottom - roofTop) * fraction)));
  }
  for (let step = segments; step >= 0; step -= 1) {
    const fraction = step / segments;
    points.push(pointAt(centerAngle + (fraction * 2 - 1) * halfBottom, deckY - roofBottom));
  }
  for (let step = 11; step >= 1; step -= 1) {
    const fraction = step / 12;
    const half = halfTop + (halfBottom - halfTop) * fraction;
    points.push(pointAt(centerAngle - half, deckY - (roofTop + (roofBottom - roofTop) * fraction)));
  }
  points.push(points[0].clone());
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  return new THREE.TubeGeometry(curve, 112, 0.24, 5, false);
}

function createPortSurface(
  boreRadius: number,
  centerAngle: number,
  roofTop: number,
  roofBottom: number,
  chordTop: number,
  chordBottom: number,
  deckY: number,
  radiusOffset = 1.3,
) {
  const rows = 10;
  const columns = 12;
  const positions: number[] = [];
  const indices: number[] = [];
  const radius = Math.max(0.1, boreRadius + radiusOffset);

  for (let row = 0; row <= rows; row += 1) {
    const vertical = row / rows;
    const roof = roofTop + (roofBottom - roofTop) * vertical;
    const chord = chordTop + (chordBottom - chordTop) * vertical;
    const halfAngle = Math.asin(Math.max(-1, Math.min(1, chord / (2 * boreRadius))));
    const y = deckY - roof;

    for (let column = 0; column <= columns; column += 1) {
      const horizontal = column / columns;
      const angle = centerAngle + (horizontal * 2 - 1) * halfAngle;
      positions.push(radius * Math.sin(angle), y, -radius * Math.cos(angle));
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const start = row * (columns + 1) + column;
      const next = start + columns + 1;
      indices.push(start, next, start + 1, start + 1, next, next + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createPortedBoreWall(
  boreRadius: number,
  wallRadius: number,
  deckY: number,
  totalHeight: number,
  portLayouts: Record<PortKey, ModelPortSetup>,
  portPlans: Record<PortKey, PortMillingPlan>,
) {
  const columns = 224;
  const rows = Math.max(128, Math.ceil(totalHeight * 2));
  const phiStart = Math.PI / 2;
  const phiLength = Math.PI;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const drop = totalHeight * row / rows;
    const y = deckY - drop;
    for (let column = 0; column <= columns; column += 1) {
      const phi = phiStart + phiLength * column / columns;
      positions.push(wallRadius * Math.sin(phi), y, wallRadius * Math.cos(phi));
    }
  }

  const cellHasPortOpening = (drop: number, phi: number) => {
    const localAngle = Math.PI - phi;
    for (const key of ["wydech", "transfer", "boost"] as const) {
      const layout = portLayouts[key];
      const plan = portPlans[key];
      if (!isPortRenderable(layout, plan, boreRadius * 2)) continue;
      const existingBottom = layout.roofHeight + layout.portHeight;
      const hasCut = plan.cutDepth > 0;
      const newRoof = hasCut ? plan.targetRoof : layout.roofHeight;
      if (drop < newRoof || drop > existingBottom) continue;

      let chord: number;
      if (hasCut && drop <= layout.roofHeight) {
        const fraction = (drop - plan.targetRoof) / Math.max(0.001, layout.roofHeight - plan.targetRoof);
        chord = layout.chordAtTarget + (layout.chordAtRoof - layout.chordAtTarget) * fraction;
      } else {
        const fraction = (drop - layout.roofHeight) / layout.portHeight;
        chord = layout.chordAtRoof + (layout.chordAtBottom - layout.chordAtRoof) * fraction;
      }

      const halfAngle = Math.asin(Math.max(-1, Math.min(1, chord / (2 * boreRadius))));
      for (const centerAngle of portAngles(key, layout.count, layout.angularSpacing)) {
        const delta = Math.atan2(Math.sin(localAngle - centerAngle), Math.cos(localAngle - centerAngle));
        if (Math.abs(delta) <= halfAngle) return true;
      }
    }
    return false;
  };

  for (let row = 0; row < rows; row += 1) {
    const drop = totalHeight * (row + 0.5) / rows;
    for (let column = 0; column < columns; column += 1) {
      const phi = phiStart + phiLength * (column + 0.5) / columns;
      if (cellHasPortOpening(drop, phi)) continue;
      const start = row * (columns + 1) + column;
      const next = start + columns + 1;
      indices.push(start, next, start + 1, start + 1, next, next + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addMesh(group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, position?: THREE.Vector3) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.copy(position);
  group.add(mesh);
  return mesh;
}

const PORT_NAMES: Record<PortKey, string> = {
  wydech: "Wydech",
  transfer: "Transfer",
  boost: "Aux / boost",
};

function spreadAngles(center: number, count: number, spacing: number) {
  const safeCount = Math.min(12, Math.max(1, Math.round(count)));
  const gap = THREE.MathUtils.degToRad(Math.min(180, Math.max(0, spacing)));
  return Array.from({ length: safeCount }, (_, index) => center + (index - (safeCount - 1) / 2) * gap);
}

function portAngles(key: PortKey, count: number, angularSpacing: number) {
  if (key === "wydech") return spreadAngles(0, count, angularSpacing);
  if (key === "boost") return spreadAngles(Math.PI, count, angularSpacing);

  const safeCount = Math.min(12, Math.max(1, Math.round(count)));
  const leftCount = Math.ceil(safeCount / 2);
  const rightCount = safeCount - leftCount;
  return [
    ...spreadAngles(-Math.PI / 2, leftCount, angularSpacing),
    ...spreadAngles(Math.PI / 2, rightCount, angularSpacing),
  ];
}

function isPortRenderable(layout: ModelPortSetup, plan: PortMillingPlan, bore: number) {
  return [layout.roofHeight, layout.portHeight, layout.chordAtRoof, layout.chordAtBottom,
    layout.chordAtTarget, layout.count, layout.angularSpacing, plan.targetRoof, plan.cutDepth].every(Number.isFinite)
    && layout.portHeight > 0
    && layout.chordAtRoof > 0 && layout.chordAtRoof <= bore
    && layout.chordAtBottom > 0 && layout.chordAtBottom <= bore
    && layout.chordAtTarget > 0 && layout.chordAtTarget <= bore
    && layout.count >= 1 && layout.angularSpacing >= 0 && layout.angularSpacing <= 180;
}

function studLocations(count: number, offset: number) {
  const corners = [-offset, offset].flatMap((x) => [-offset, offset].map((z) => ({ x, z })));
  if (count === 6) return [...corners, { x: 0, z: -offset * 1.2 }, { x: 0, z: offset * 1.2 }];
  if (count === 8) return [...corners, { x: -offset * 1.1, z: 0 }, { x: offset * 1.1, z: 0 }, { x: 0, z: -offset * 1.1 }, { x: 0, z: offset * 1.1 }];
  return corners;
}

function buildModel(props: CylinderModelProps) {
  const group = new THREE.Group();
  const boreRadius = Math.max(5, props.bore / 2);
  const deckY = props.totalHeight / 2;
  const jacketHeight = props.totalHeight * 0.62;
  const jacketCenterY = deckY - jacketHeight / 2;
  const jacketRadius = Math.max(boreRadius + 8, props.jacketDiameter / 2);
  const spigotRadius = Math.max(boreRadius + 3, props.spigotDiameter / 2);
  const baseY = deckY - props.totalHeight;
  const spigotLength = props.totalHeight - jacketHeight;
  const spigotCenterY = (deckY - jacketHeight + baseY) / 2;
  const studOffset = props.studDiagonal / (2 * Math.sqrt(2));
  const studs = studLocations(props.studCount, studOffset);
  const cutaway = props.cutaway;
  // The cutaway removes the front half and leaves the rear bore wall visible through it.
  const castMetal = new THREE.MeshStandardMaterial({ color: 0x858b8e, metalness: 0.42, roughness: 0.56, side: THREE.DoubleSide });
  const silver = new THREE.MeshStandardMaterial({ color: 0x9baab3, metalness: 0.34, roughness: 0.38, side: THREE.DoubleSide });
  const brightMetal = new THREE.MeshStandardMaterial({ color: 0xc3c9cc, metalness: 0.62, roughness: 0.32, side: THREE.DoubleSide });
  const shadowMetal = new THREE.MeshStandardMaterial({ color: 0x56636b, metalness: 0.28, roughness: 0.46, side: THREE.DoubleSide });
  const boreMaterial = new THREE.MeshStandardMaterial({ color: 0x788890, metalness: 0.16, roughness: 0.58, side: THREE.DoubleSide });
  const portMaterials: Record<PortKey, THREE.Material> = {
    wydech: new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false }),
    transfer: new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
    boost: new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
  };
  const cutMaterial = new THREE.MeshBasicMaterial({ color: 0xf02f35, transparent: true, opacity: 0.96, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const selectedOutline = new THREE.MeshBasicMaterial({ color: 0x00aeca, side: THREE.DoubleSide });
  const cutOutline = new THREE.MeshBasicMaterial({ color: 0xff4b4b, side: THREE.DoubleSide });
  const ductRadius = Math.max(1, props.exhaustDuctDiameter / 2);
  const exhaustLayout = props.portLayouts.wydech;
  const exhaustDrop = Number.isFinite(exhaustLayout.roofHeight) && Number.isFinite(exhaustLayout.portHeight) && exhaustLayout.portHeight > 0
    ? exhaustLayout.roofHeight + exhaustLayout.portHeight / 2 : props.totalHeight * 0.3;
  const exhaustY = deckY - exhaustDrop;

  const jacket = createOuterCylinder(jacketRadius, jacketCenterY, jacketHeight, cutaway, exhaustY, ductRadius + 0.5);
  const jacketMaterial = castMetal;
  addMesh(group, jacket, jacketMaterial);

  // Cast transition lips and mounting ears break up the plain cylindrical jacket.
  for (const fraction of [0.1, 0.88]) {
    const seamY = deckY - jacketHeight * fraction;
    const seam = addMesh(group, new THREE.TorusGeometry(jacketRadius * 0.985, 0.72, 8, 72), shadowMetal, new THREE.Vector3(0, seamY, 0));
    seam.rotation.x = Math.PI / 2;
  }
  for (const side of [-1, 1]) {
    addMesh(group, new THREE.BoxGeometry(9, 21, 10), castMetal, new THREE.Vector3(side * (jacketRadius - 1), deckY - jacketHeight * 0.72, 5));
    addMesh(group, new THREE.BoxGeometry(7, 15, 8), shadowMetal, new THREE.Vector3(side * (jacketRadius + 2), deckY - jacketHeight * 0.72, 5));
  }

  if (cutaway) {
    // The open half-shell and the high-contrast port overlays are the focus of this mode.
  } else if (props.coolingType === "air") {
    const finMaterial = new THREE.MeshStandardMaterial({ color: 0xd0d7db, metalness: 0.36, roughness: 0.46, side: THREE.DoubleSide });
    for (let index = 1; index <= 8; index += 1) {
      const y = deckY - jacketHeight * index / 9;
      const fin = addMesh(group, new THREE.TorusGeometry(jacketRadius + 1.1, 1.05, 8, 48), finMaterial, new THREE.Vector3(0, y, 0));
      fin.rotation.x = Math.PI / 2;
    }
  }

  // In cutaway mode, the liner and bore wall have real mesh openings for each entered port.
  const liner = cutaway
    ? createPortedBoreWall(boreRadius, boreRadius + 0.7, deckY, props.totalHeight, props.portLayouts, props.portPlans)
    : new THREE.CylinderGeometry(boreRadius + 0.7, boreRadius + 0.7, props.totalHeight, 64, 1, true);
  addMesh(group, liner, brightMetal, new THREE.Vector3(0, deckY - props.totalHeight / 2, 0));
  const boreWall = cutaway
    ? createPortedBoreWall(boreRadius, boreRadius, deckY, props.totalHeight, props.portLayouts, props.portPlans)
    : new THREE.CylinderGeometry(boreRadius, boreRadius, props.totalHeight, 64, 1, true);
  addMesh(group, boreWall, boreMaterial, new THREE.Vector3(0, deckY - props.totalHeight / 2, 0));

  // Lower spigot, machined base flange and sealing faces.
  if (!cutaway) {
    addMesh(group, new THREE.CylinderGeometry(spigotRadius, spigotRadius + 1, spigotLength, 48, 1, true), shadowMetal, new THREE.Vector3(0, spigotCenterY, 0));
    addMesh(group, new THREE.CylinderGeometry(spigotRadius + 3, spigotRadius + 4, 3.5, 48), brightMetal, new THREE.Vector3(0, deckY - jacketHeight - 1.5, 0));
    addMesh(group, new THREE.CylinderGeometry(spigotRadius + 2.5, spigotRadius + 2.5, 1.2, 48), shadowMetal, new THREE.Vector3(0, deckY - jacketHeight - 3.8, 0));
    addMesh(group, new THREE.CylinderGeometry(spigotRadius + 1, spigotRadius, 2.5, 48), silver, new THREE.Vector3(0, baseY + 1.25, 0));
  }

  // The machined deck has four cast bolt pads and a matching four-hole pattern.
  addMesh(group, createDeckRing(boreRadius, deckY, jacketRadius, studs), brightMetal);
  addMesh(group, new THREE.TorusGeometry(jacketRadius + 0.4, 0.75, 8, 64), brightMetal, new THREE.Vector3(0, deckY - 1, 0)).rotation.x = Math.PI / 2;
  addMesh(group, new THREE.TorusGeometry(boreRadius + 1.3, 0.7, 8, 64), shadowMetal, new THREE.Vector3(0, deckY - 0.1, 0)).rotation.x = Math.PI / 2;
  const boltHoleRadius = Math.max(2.2, Math.min(3.1, boreRadius * 0.052));
  for (const { x, z } of studs) {
    addMesh(group, new THREE.CylinderGeometry(boltHoleRadius * 0.9, boltHoleRadius * 0.9, 1.2, 24), new THREE.MeshBasicMaterial({ color: 0x171b1d }), new THREE.Vector3(x, deckY - 0.8, z));
    const chamfer = addMesh(group, new THREE.TorusGeometry(boltHoleRadius + 0.3, 0.32, 8, 24), shadowMetal, new THREE.Vector3(x, deckY + 0.78, z));
    chamfer.rotation.x = Math.PI / 2;
  }
  if (!cutaway) {
    addMesh(group, new THREE.CircleGeometry(Math.max(1, boreRadius - 1), 48), new THREE.MeshBasicMaterial({ color: 0x07090b, side: THREE.DoubleSide }), new THREE.Vector3(0, deckY - 10, 0)).rotation.x = -Math.PI / 2;
  }

  // The reference part has threaded holes in its mounting ears, not exposed head studs.

  // Cast bosses and water connections on the outside of the jacket.
  if (!cutaway && props.coolingType === "liquid") {
    addMesh(group, new THREE.CylinderGeometry(6.4, 8, 11, 16), silver, new THREE.Vector3(-jacketRadius - 1, deckY - jacketHeight * 0.38, -4)).rotation.z = Math.PI / 2;
    addMesh(group, new THREE.TorusGeometry(6.2, 0.9, 8, 20), brightMetal, new THREE.Vector3(-jacketRadius - 6, deckY - jacketHeight * 0.38, -4)).rotation.y = Math.PI / 2;
    addMesh(group, new THREE.CylinderGeometry(5.4, 6.1, 10, 16), silver, new THREE.Vector3(jacketRadius, deckY - jacketHeight * 0.27, 1)).rotation.z = Math.PI / 2;
  }

  // The exhaust passage is a true round bore and uses the entered internal diameter.
  {
    const innerZ = -(boreRadius + 0.65);
    const outerZ = -(jacketRadius + 7.5);
    const ductLength = Math.abs(outerZ - innerZ);
    const castBoss = addMesh(group, new THREE.CylinderGeometry(ductRadius + 5, ductRadius + 7, 9, 44), castMetal, new THREE.Vector3(0, exhaustY, -(jacketRadius + 3.2)));
    castBoss.rotation.x = -Math.PI / 2;
    const duct = new THREE.CylinderGeometry(ductRadius, ductRadius, ductLength, 40, 1, true);
    addMesh(group, duct, shadowMetal, new THREE.Vector3(0, exhaustY, (innerZ + outerZ) / 2)).rotation.x = -Math.PI / 2;
    addMesh(group, new THREE.CircleGeometry(ductRadius * 0.94, 40), new THREE.MeshBasicMaterial({ color: 0x13212a, side: THREE.DoubleSide }), new THREE.Vector3(0, exhaustY, innerZ));
    addMesh(group, new THREE.CircleGeometry(ductRadius * 0.94, 40), new THREE.MeshBasicMaterial({ color: 0x10171b, side: THREE.DoubleSide }), new THREE.Vector3(0, exhaustY, outerZ));
    addMesh(group, createAnnularFlange(ductRadius * 0.98, ductRadius * 1.48, 2.4), brightMetal, new THREE.Vector3(0, exhaustY, outerZ));
    addMesh(group, new THREE.TorusGeometry(ductRadius * 1.08, Math.max(0.5, props.exhaustDuctDiameter * 0.018), 10, 40), selectedOutline, new THREE.Vector3(0, exhaustY, innerZ)).rotation.x = 0;
    addMesh(group, new THREE.TorusGeometry(ductRadius * 1.02, Math.max(0.5, props.exhaustDuctDiameter * 0.018), 10, 40), brightMetal, new THREE.Vector3(0, exhaustY, outerZ));
    const flangeEarRadius = Math.max(2.8, ductRadius * 0.28);
    for (const side of [-1, 1]) {
      const ear = addMesh(group, new THREE.CylinderGeometry(flangeEarRadius, flangeEarRadius, 2.4, 24), brightMetal, new THREE.Vector3(side * (ductRadius + 6), exhaustY, outerZ));
      ear.rotation.x = -Math.PI / 2;
      const hole = addMesh(group, new THREE.CircleGeometry(Math.max(1.2, flangeEarRadius * 0.38), 20), new THREE.MeshBasicMaterial({ color: 0x283034, side: THREE.DoubleSide }), new THREE.Vector3(side * (ductRadius + 6), exhaustY, outerZ - 1.25));
      hole.rotation.y = Math.PI;
    }
  }

  // A small cast-in identification plaque on the outside view.
  if (!cutaway) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#d5dbe0";
      context.font = "bold 54px Arial";
      context.textAlign = "center";
      context.fillText(/am6/i.test(props.modelName) ? "AM6" : "2T", 128, 65);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const plaque = addMesh(group, new THREE.PlaneGeometry(26, 9), new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide }), new THREE.Vector3(0, 3, 35.7));
    plaque.rotation.x = -0.03;
  }

  for (const key of ["wydech", "transfer", "boost"] as const) {
    const layout = props.portLayouts[key];
    const plan = props.portPlans[key];
    if (!isPortRenderable(layout, plan, props.bore)) continue;
    const angles = portAngles(key, layout.count, layout.angularSpacing);
    const hoverData: PortHoverData = {
      key,
      label: key === props.portKey ? props.portLabel : PORT_NAMES[key],
      position: key === "wydech" ? "przód cylindra · 0°" : key === "transfer" ? "boki cylindra · ±90°" : "tył cylindra · 180°",
      selected: key === props.portKey,
      roofHeight: layout.roofHeight,
      targetRoof: plan.targetRoof,
      cutDepth: plan.cutDepth,
      currentChord: layout.chordAtRoof,
      targetChord: layout.chordAtTarget,
    };

    for (const angle of angles) {
      const currentWindow = addMesh(group,
        createPortSurface(boreRadius, angle, layout.roofHeight, layout.roofHeight + layout.portHeight, layout.chordAtRoof, layout.chordAtBottom, deckY),
        portMaterials[key],
      );
      currentWindow.userData.portHover = hoverData;

      if (key === props.portKey) {
        const outline = addMesh(group,
          createPortOutline(boreRadius, angle, layout.roofHeight, layout.roofHeight + layout.portHeight, layout.chordAtRoof, layout.chordAtBottom, deckY, 2.35),
          selectedOutline,
        );
        outline.userData.portHover = hoverData;
      }

      if (plan.cutDepth > 0) {
        const newPortBand = addMesh(group,
          createPortSurface(boreRadius, angle, plan.targetRoof, layout.roofHeight, layout.chordAtTarget, layout.chordAtRoof, deckY, 1.4),
          portMaterials[key],
        );
        newPortBand.userData.portHover = hoverData;
        const removedSurface = addMesh(group,
          createPortSurface(boreRadius, angle, plan.targetRoof, layout.roofHeight, layout.chordAtTarget, layout.chordAtRoof, deckY, 1.8),
          cutMaterial,
        );
        removedSurface.userData.portHover = hoverData;
        const removedOutline = addMesh(group,
          createPortOutline(boreRadius, angle, plan.targetRoof, layout.roofHeight, layout.chordAtTarget, layout.chordAtRoof, deckY, 2.7),
          cutOutline,
        );
        removedOutline.userData.portHover = hoverData;
        if (key === props.portKey) {
          const arrowLength = Math.max(7, Math.min(15, plan.cutDepth * 3.5));
          const arrowRadius = boreRadius + 4.2;
          const arrowOrigin = new THREE.Vector3(
            arrowRadius * Math.sin(angle),
            deckY - (plan.targetRoof + layout.roofHeight) / 2,
            -arrowRadius * Math.cos(angle),
          );
          const millingArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), arrowOrigin, arrowLength, 0xff353b, arrowLength * 0.35, arrowLength * 0.24);
          millingArrow.traverse((object) => { object.userData.portHover = hoverData; });
          group.add(millingArrow);
        }
      }
    }
  }

  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return group;
}

function disposeGroup(group: THREE.Group) {
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
        material.dispose();
      });
    }
  });
}

function fitCylinderCamera(
  camera: THREE.PerspectiveCamera,
  cutaway: boolean,
  totalHeight: number,
  jacketDiameter: number,
  studDiagonal: number,
  exhaustDuctDiameter: number,
) {
  const extent = Math.max(totalHeight, jacketDiameter, studDiagonal + 20, exhaustDuctDiameter * 2);
  const distance = Math.max(210, extent * 2.8);
  camera.position.set(
    cutaway ? 0 : -Math.max(76, jacketDiameter * 1.35),
    Math.max(30, totalHeight * (cutaway ? 0.14 : 0.62)),
    (cutaway ? 1 : -1) * distance,
  );
  camera.lookAt(0, 0, 0);
  return extent;
}

export default function CylinderModel(props: CylinderModelProps) {
  const { modelName, bore, portKey, portLabel, portLayouts, portPlans, roofHeight, targetRoof, portHeight, currentChord, bottomChord, targetChord, count, angularSpacing, cutaway, coolingType, totalHeight, jacketDiameter, spigotDiameter, exhaustDuctDiameter, studDiagonal, studCount } = props;
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const [hoveredPort, setHoveredPort] = useState<PortHoverState | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      mount.textContent = "Przeglądarka nie udostępnia WebGL. Otwórz podgląd w przeglądarce z włączonym przyspieszeniem sprzętowym.";
      mount.classList.add("flex", "items-center", "justify-center", "p-8", "text-center", "text-sm", "text-zinc-400");
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1014);
    const camera = new THREE.PerspectiveCamera(38, 1, 1, Math.max(1000, totalHeight * 16, jacketDiameter * 16, studDiagonal * 16));
    const extent = fitCylinderCamera(camera, cutaway, totalHeight, jacketDiameter, studDiagonal, exhaustDuctDiameter);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.className = "block h-full w-full touch-none";
    mount.replaceChildren(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf8fbfd, 0x68737b, 3.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(-75, 125, 100);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x9ad8ed, 2.7);
    rimLight.position.set(-90, 35, -80);
    scene.add(rimLight);
    const frontLight = new THREE.PointLight(0xffffff, 145, 340);
    frontLight.position.set(-35, 48, -125);
    scene.add(frontLight);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(Math.max(jacketDiameter, totalHeight) * 0.65, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -totalHeight / 2 - 2;
    scene.add(shadow);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = Math.max(82, extent * 0.78);
    controls.maxDistance = Math.max(420, extent * 8);
    controls.maxPolarAngle = Math.PI * 0.88;
    controls.update();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const model = modelRef.current;
      const hit = model ? raycaster.intersectObject(model, true)[0] : undefined;
      const info = hit?.object.userData.portHover as PortHoverData | undefined;
      renderer.domElement.style.cursor = info ? "help" : "grab";
      if (!info) {
        setHoveredPort(null);
        return;
      }
      setHoveredPort({ ...info, x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
    const onPointerLeave = () => {
      renderer.domElement.style.cursor = "grab";
      setHoveredPort(null);
    };
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(mount);

    let frame = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [totalHeight, jacketDiameter, spigotDiameter, exhaustDuctDiameter, studDiagonal, studCount, cutaway]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (modelRef.current) {
      scene.remove(modelRef.current);
      disposeGroup(modelRef.current);
    }
    const model = buildModel({ modelName, bore, portKey, portLabel, portLayouts, portPlans, roofHeight, targetRoof, portHeight, currentChord, bottomChord, targetChord, count, angularSpacing, cutaway, coolingType, totalHeight, jacketDiameter, spigotDiameter, exhaustDuctDiameter, studDiagonal, studCount });
    scene.add(model);
    modelRef.current = model;
    return () => {
      scene.remove(model);
      disposeGroup(model);
      if (modelRef.current === model) modelRef.current = null;
    };
  }, [modelName, bore, portKey, portLabel, portLayouts, portPlans, roofHeight, targetRoof, portHeight, currentChord, bottomChord, targetChord, count, angularSpacing, cutaway, coolingType, totalHeight, jacketDiameter, spigotDiameter, exhaustDuctDiameter, studDiagonal, studCount]);

  const resetCamera = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    fitCylinderCamera(camera, cutaway, totalHeight, jacketDiameter, studDiagonal, exhaustDuctDiameter);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const hoverFormat = (value: number) => value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const hoverWidthDelta = hoveredPort ? hoveredPort.targetChord - hoveredPort.currentChord : 0;
  const tooltipLeft = hoveredPort ? Math.max(8, Math.min(hoveredPort.x + 14, (mountRef.current?.clientWidth ?? 320) - 286)) : 0;
  const tooltipTop = hoveredPort ? Math.max(8, Math.min(hoveredPort.y + 14, (mountRef.current?.clientHeight ?? 430) - 176)) : 0;

  return (
    <div className="relative h-[min(70vh,620px)] min-h-[430px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1014]">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-[#10171b]/90 px-3 py-2 shadow-sm backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-200">Cylinder 3D · {props.cutaway ? "przekrój portów" : "bryła zewnętrzna"}</p>
        <p className="mt-1 text-xs text-zinc-200">{props.modelName} · Ø {props.bore.toLocaleString("pl-PL")} mm · H {props.totalHeight} mm</p>
        {props.portKey === "wydech" && <p className="mt-1 text-[10px] font-semibold text-cyan-200">Kanał okrągły · Ø {props.exhaustDuctDiameter.toLocaleString("pl-PL")} mm</p>}
      </div>
      {hoveredPort && <div className="pointer-events-none absolute z-20 w-[270px] rounded-xl border border-red-400/50 bg-[#120d0e]/95 p-3 text-xs text-zinc-200 shadow-xl backdrop-blur" style={{ left: tooltipLeft, top: tooltipTop }}>
        <p className="font-black uppercase tracking-wider text-white">{hoveredPort.label}{hoveredPort.selected ? " · aktywny" : ""}</p>
        <p className="mt-1 text-[11px] text-zinc-400">Położenie: {hoveredPort.position}</p>
        {hoveredPort.cutDepth > 0.005 ? <>
          <p className="mt-2 text-sm font-bold text-red-300">Frezuj dach: {hoverFormat(hoveredPort.cutDepth)} mm</p>
          <p className="mt-1 leading-5">Kierunek: ku płaszczyźnie bloku, w górę cylindra.</p>
          <p className="mt-1 font-mono text-[11px] text-zinc-400">Położenie dachu: {hoverFormat(hoveredPort.roofHeight)} → {hoverFormat(hoveredPort.targetRoof)} mm od bloku</p>
        </> : hoveredPort.cutDepth < -0.005 ? <>
          <p className="mt-2 text-sm font-bold text-amber-200">Brak frezowania w tym kierunku</p>
          <p className="mt-1 leading-5">Cel wymaga obniżenia dachu o {hoverFormat(Math.abs(hoveredPort.cutDepth))} mm, w stronę karteru.</p>
        </> : <p className="mt-2 leading-5 text-zinc-300">Brak materiału do zebrania przy zadanym celu.</p>}
        <p className="mt-2 border-t border-white/10 pt-2 font-mono text-[11px] text-zinc-400">Cięciwa dachu: {hoverFormat(hoveredPort.currentChord)} → {hoverFormat(hoveredPort.targetChord)} mm</p>
        {hoverWidthDelta > 0.005 && <p className="mt-1 text-[11px] text-zinc-400">Rozszerz okno o {hoverFormat(hoverWidthDelta)} mm łącznie, po {hoverFormat(hoverWidthDelta / 2)} mm na stronę.</p>}
        {hoverWidthDelta < -0.005 && <p className="mt-1 text-[11px] text-amber-200/80">Węższe okno wymaga odbudowy materiału, nie frezowania.</p>}
      </div>}
      <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-[10px] leading-4 text-zinc-100 backdrop-blur">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> <span className="ml-1">czerwony obszar: materiał do zebrania</span><br />Czerwona strzałka pokazuje kierunek frezowania · najedź, aby zobaczyć mm
      </div>
      <button type="button" onClick={resetCamera} className="absolute bottom-4 right-4 rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-xs font-semibold text-zinc-200 backdrop-blur hover:bg-white/10">Reset widoku</button>
    </div>
  );
}

