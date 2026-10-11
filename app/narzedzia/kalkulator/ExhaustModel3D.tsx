"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export type ExhaustProfileSample = { x: number; y: number; radius: number; s: number };
type ExhaustModel3DProps = {
  samples: ExhaustProfileSample[];
  seams: number[];
  wall: number;
};

function sampleAt(samples: ExhaustProfileSample[], distance: number) {
  const target = Math.max(0, Math.min(samples[samples.length - 1]?.s ?? 0, distance));
  let index = 1;
  while (index < samples.length - 1 && samples[index].s < target) index += 1;
  const before = samples[index - 1];
  const after = samples[index];
  const fraction = (target - before.s) / Math.max(0.001, after.s - before.s);
  const center = new THREE.Vector3(
    before.x + (after.x - before.x) * fraction,
    before.y + (after.y - before.y) * fraction,
    0,
  );
  const tangent = new THREE.Vector3(after.x - before.x, after.y - before.y, 0).normalize();
  const radius = before.radius + (after.radius - before.radius) * fraction;
  return { center, tangent, radius };
}

function makeTube(samples: ExhaustProfileSample[]) {
  const sides = 40;
  const positions: number[] = [];
  const indices: number[] = [];
  const count = samples.length;

  for (let index = 0; index < count; index += 1) {
    const previous = samples[Math.max(0, index - 1)];
    const next = samples[Math.min(count - 1, index + 1)];
    const tangent = new THREE.Vector3(next.x - previous.x, next.y - previous.y, 0).normalize();
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
    const binormal = tangent.clone().cross(normal).normalize();
    for (let side = 0; side <= sides; side += 1) {
      const angle = side / sides * Math.PI * 2;
      const point = new THREE.Vector3(samples[index].x, samples[index].y, 0)
        .addScaledVector(normal, Math.cos(angle) * samples[index].radius)
        .addScaledVector(binormal, Math.sin(angle) * samples[index].radius);
      positions.push(point.x, point.y, point.z);
    }
  }

  for (let index = 0; index < count - 1; index += 1) {
    for (let side = 0; side < sides; side += 1) {
      const start = index * (sides + 1) + side;
      const next = start + sides + 1;
      indices.push(start, start + 1, next, start + 1, next + 1, next);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeFlange(outerRadius: number, innerRadius: number, thickness: number) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, Math.max(0.5, innerRadius), 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 48 });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

function addOrientedMesh(group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, center: THREE.Vector3, axis: THREE.Vector3) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(center);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis.clone().normalize());
  group.add(mesh);
  return mesh;
}

function addRing(group: THREE.Group, at: ReturnType<typeof sampleAt>, radius: number, tube: number, material: THREE.Material) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 56), material);
  ring.position.copy(at.center);
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), at.tangent);
  group.add(ring);
}

function getBounds(samples: ExhaustProfileSample[], extraRadius = 0) {
  const bounds = new THREE.Box3();
  for (const sample of samples) {
    const radius = sample.radius + extraRadius;
    bounds.expandByPoint(new THREE.Vector3(sample.x - radius, sample.y - radius, -radius));
    bounds.expandByPoint(new THREE.Vector3(sample.x + radius, sample.y + radius, radius));
  }
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  return { bounds, size, center, span: Math.max(size.x, size.y, size.z, 1) };
}

function buildExhaustModel({ samples, seams, wall }: ExhaustModel3DProps) {
  const group = new THREE.Group();
  if (samples.length < 2) return group;

  const safeWall = Math.max(0.4, wall);
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xaebbc4, metalness: 0.78, roughness: 0.25, clearcoat: 0.64, clearcoatRoughness: 0.18, side: THREE.DoubleSide });
  const weld = new THREE.MeshStandardMaterial({ color: 0x687780, metalness: 0.72, roughness: 0.35 });
  const flangeMaterial = new THREE.MeshStandardMaterial({ color: 0xc4cdd2, metalness: 0.82, roughness: 0.2 });
  const dark = new THREE.MeshBasicMaterial({ color: 0x10171b, side: THREE.DoubleSide });

  const total = samples[samples.length - 1].s;
  // The full expansion chamber, including the narrow stinger, follows the 2D profile.
  group.add(new THREE.Mesh(makeTube(samples), shell));
  for (const distance of seams) {
    if (distance >= total) continue;
    const seam = sampleAt(samples, distance);
    addRing(group, seam, seam.radius * 1.004, Math.max(0.35, safeWall * 0.27), weld);
  }

  const inlet = sampleAt(samples, 0);
  const inletThickness = Math.max(2.4, safeWall * 2.2);
  addOrientedMesh(group, makeFlange(inlet.radius * 1.48, inlet.radius * 0.82, inletThickness), flangeMaterial, inlet.center, inlet.tangent);
  addRing(group, inlet, inlet.radius * 0.82, Math.max(0.55, safeWall * 0.45), weld);

  // A two-ear mounting flange mirrors the spring/bolt plate used at the cylinder outlet.
  const flangeNormal = new THREE.Vector3(-inlet.tangent.y, inlet.tangent.x, 0).normalize();
  const earRadius = Math.max(2.8, inlet.radius * 0.34);
  const earOffset = inlet.radius * 1.18;
  for (const side of [-1, 1]) {
    const earCenter = inlet.center.clone().addScaledVector(flangeNormal, side * earOffset);
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(earRadius, earRadius, inletThickness, 28), flangeMaterial);
    ear.position.copy(earCenter);
    ear.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), inlet.tangent);
    group.add(ear);
    const holeCenter = earCenter.clone().addScaledVector(inlet.tangent, inletThickness * 0.51);
    addOrientedMesh(group, new THREE.CircleGeometry(Math.max(1.3, earRadius * 0.38), 24), dark, holeCenter, inlet.tangent);
  }

  // Finish the stinger with a plain outlet lip; the separate silencer can is omitted.
  const outlet = sampleAt(samples, total);
  const outletEnd = outlet.center.clone().addScaledVector(outlet.tangent, 0.15);
  addOrientedMesh(group, new THREE.CircleGeometry(Math.max(1, outlet.radius * 0.82), 36), dark, outletEnd, outlet.tangent);
  addRing(group, outlet, outlet.radius, Math.max(0.5, safeWall * 0.3), flangeMaterial);

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
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

export default function ExhaustModel3D(props: ExhaustModel3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || props.samples.length < 2) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      mount.textContent = "Ta przeglądarka nie udostępnia WebGL. Podgląd 2D pozostaje dostępny.";
      mount.classList.add("flex", "items-center", "justify-center", "p-8", "text-center", "text-sm", "text-zinc-500");
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111820);
    const camera = new THREE.PerspectiveCamera(38, 1, 1, 6000);
    const bounds = getBounds(props.samples, props.wall + 4);
    const frameDimension = Math.max(bounds.size.y, bounds.size.x / Math.max(mount.clientWidth / Math.max(mount.clientHeight, 1), 0.6));
    const distance = frameDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.22;
    camera.position.set(bounds.center.x, bounds.center.y + distance * 0.09, distance + bounds.center.z);
    camera.lookAt(bounds.center);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = "block h-full w-full touch-none";
    mount.replaceChildren(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe6f1f6, 0x25303a, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 4.6);
    key.position.set(bounds.center.x - bounds.span * 0.22, bounds.center.y + bounds.span * 0.5, bounds.span * 0.72);
    scene.add(key);
    const strip = new THREE.DirectionalLight(0x9ecfe2, 3.1);
    strip.position.set(bounds.center.x + bounds.span * 0.15, bounds.center.y - bounds.span * 0.22, -bounds.span * 0.8);
    scene.add(strip);
    const fill = new THREE.PointLight(0xffffff, 2.2, bounds.span * 4);
    fill.position.set(bounds.center.x + bounds.span * 0.35, bounds.center.y + bounds.span * 0.3, bounds.span * 0.9);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = Math.max(85, bounds.span * 0.45);
    controls.maxDistance = Math.max(2600, bounds.span * 4.5);
    controls.target.copy(bounds.center);
    controls.update();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    const resizeObserver = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
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
      if (modelRef.current) {
        scene.remove(modelRef.current);
        disposeGroup(modelRef.current);
        modelRef.current = null;
      }
      renderer.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [props.samples]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (modelRef.current) {
      scene.remove(modelRef.current);
      disposeGroup(modelRef.current);
    }
    const model = buildExhaustModel(props);
    scene.add(model);
    modelRef.current = model;
    return () => {
      scene.remove(model);
      disposeGroup(model);
      if (modelRef.current === model) modelRef.current = null;
    };
  }, [props]);

  const resetCamera = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const mount = mountRef.current;
    if (!camera || !controls || !mount) return;
    const bounds = getBounds(props.samples, props.wall + 4);
    const aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
    const frameDimension = Math.max(bounds.size.y, bounds.size.x / Math.max(aspect, 0.6));
    const distance = frameDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.22;
    camera.position.set(bounds.center.x, bounds.center.y + distance * 0.09, distance + bounds.center.z);
    controls.target.copy(bounds.center);
    controls.update();
  };

  return (
    <div className="relative h-[420px] min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#111820] sm:h-[480px]">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-[#0b1117]/70 px-3 py-2 backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-200">2T expansion chamber · 3D</p>
        <p className="mt-1 text-xs text-zinc-300">Kolanko 180°, spawane sekcje i stinger · bez tłumika</p>
      </div>
      <button type="button" onClick={resetCamera} className="absolute right-4 top-4 rounded-lg border border-white/10 bg-[#0b1117]/75 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-cyan-200/40 hover:text-white">Reset widoku</button>
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/10 bg-[#0b1117]/75 px-3 py-2 text-[10px] text-zinc-400 backdrop-blur">LPM: obrót · scroll: zoom · przeciągnij, aby obejrzeć przekrój</div>
    </div>
  );
}
