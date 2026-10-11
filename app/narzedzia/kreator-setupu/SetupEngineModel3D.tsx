"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { SetupEngine } from "../setupCatalog";

type Props = { engine: SetupEngine };

function makeEngine(engine: SetupEngine) {
  const derbi = engine !== "Minarelli AM6";
  const model = new THREE.Group();
  const alloy = new THREE.MeshStandardMaterial({ color: derbi ? 0x9da3a6 : 0xa9afb2, metalness: 0.72, roughness: 0.38 });
  const machined = new THREE.MeshStandardMaterial({ color: 0xc5c9ca, metalness: 0.84, roughness: 0.24 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x171a1c, metalness: 0.52, roughness: 0.42 });
  const finMaterial = new THREE.MeshStandardMaterial({ color: 0x858c90, metalness: 0.76, roughness: 0.34 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x101315, metalness: 0.08, roughness: 0.82 });
  const brass = new THREE.MeshStandardMaterial({ color: 0x977044, metalness: 0.7, roughness: 0.3 });
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xe4e2dc, metalness: 0.1, roughness: 0.32 });

  const roundedShape = (width: number, height: number, radius: number) => {
    const x = width / 2;
    const y = height / 2;
    const r = Math.min(radius, x * 0.8, y * 0.8);
    const shape = new THREE.Shape();
    shape.moveTo(-x + r, -y);
    shape.lineTo(x - r, -y);
    shape.quadraticCurveTo(x, -y, x, -y + r);
    shape.lineTo(x, y - r);
    shape.quadraticCurveTo(x, y, x - r, y);
    shape.lineTo(-x + r, y);
    shape.quadraticCurveTo(-x, y, -x, y - r);
    shape.lineTo(-x, -y + r);
    shape.quadraticCurveTo(-x, -y, -x + r, -y);
    return shape;
  };
  const ellipseShape = (rx: number, ry: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -ry);
    shape.bezierCurveTo(rx * 0.56, -ry, rx, -ry * 0.62, rx, 0);
    shape.bezierCurveTo(rx, ry * 0.58, rx * 0.58, ry, 0, ry);
    shape.bezierCurveTo(-rx * 0.56, ry, -rx, ry * 0.62, -rx, 0);
    shape.bezierCurveTo(-rx, -ry * 0.58, -rx * 0.58, -ry, 0, -ry);
    return shape;
  };
  const solid = (shape: THREE.Shape, depth: number, material: THREE.Material, x: number, y: number, z: number, bevel = 0.04) => {
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSegments: 3,
      steps: 1,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 12,
    }), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    model.add(mesh);
    return mesh;
  };
  const cylinder = (radiusTop: number, radiusBottom: number, height: number, material: THREE.Material, x: number, y: number, z: number, radial = 48, group = model) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const axialCylinder = (r1: number, r2: number, length: number, material: THREE.Material, center: THREE.Vector3, direction: THREE.Vector3, radial = 32) => {
    const mesh = cylinder(r1, r2, length, material, center.x, center.y, center.z, radial);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return mesh;
  };
  const frontDisc = (radius: number, depth: number, material: THREE.Material, x: number, y: number, z: number) =>
    solid(ellipseShape(radius, radius), depth, material, x, y, z, Math.min(0.035, depth * 0.3));

  // Rounded cast crankcase, with fuller transfer and gearbox shapes instead of a row of cubes.
  const caseShape = new THREE.Shape();
  caseShape.moveTo(-1.34, -0.33);
  caseShape.bezierCurveTo(-1.36, -0.63, -1.12, -0.89, -0.78, -0.9);
  caseShape.bezierCurveTo(-0.48, -1.05, -0.12, -0.98, 0.1, -0.82);
  caseShape.bezierCurveTo(0.42, -0.94, 0.77, -0.91, 0.99, -0.71);
  caseShape.bezierCurveTo(1.35, -0.63, 1.51, -0.32, 1.44, 0.03);
  caseShape.bezierCurveTo(1.56, 0.34, 1.34, 0.58, 1.04, 0.6);
  caseShape.bezierCurveTo(0.82, 0.82, 0.4, 0.82, 0.12, 0.65);
  caseShape.bezierCurveTo(-0.2, 0.8, -0.55, 0.79, -0.78, 0.58);
  caseShape.bezierCurveTo(-1.2, 0.56, -1.44, 0.2, -1.34, -0.33);
  caseShape.closePath();
  solid(caseShape, 0.94, alloy, 0, -0.25, -0.47, 0.065);
  solid(roundedShape(2.63, 1.28, 0.34), 0.045, machined, -0.02, -0.2, 0.47, 0.018);
  solid(roundedShape(2.5, 1.16, 0.31), 0.07, dark, -0.02, -0.2, 0.51, 0.025);

  // Canted barrel and stacked cast cooling fins, the defining silhouette of the little two-stroke.
  const barrel = new THREE.Group();
  barrel.position.set(0.14, 0.24, 0.02);
  barrel.rotation.z = -0.22;
  model.add(barrel);
  cylinder(0.45, 0.48, 0.17, machined, 0, 0.03, 0, 56, barrel);
  cylinder(0.39, 0.4, 0.92, dark, 0, 0.53, 0, 56, barrel);
  for (let index = 0; index < 8; index += 1) {
    const y = 0.16 + index * 0.12;
    const radius = index < 3 ? 0.54 : 0.52 - (index - 3) * 0.008;
    cylinder(radius, radius * 0.99, 0.052, index % 2 === 0 ? finMaterial : machined, 0, y, 0, 56, barrel);
  }
  cylinder(0.48, 0.5, 0.27, alloy, 0, 1.08, 0, 56, barrel);
  for (let index = 0; index < 4; index += 1) {
    const y = 1.22 + index * 0.105;
    const radius = 0.53 - Math.max(0, index - 1) * 0.018;
    cylinder(radius, radius, 0.052, index % 2 === 0 ? machined : finMaterial, 0, y, 0, 56, barrel);
  }
  cylinder(0.47, 0.5, 0.18, machined, 0, 1.62, 0, 56, barrel);
  // Studs and the spark plug emerge from the top face.
  for (const x of [-0.34, 0.34]) {
    for (const z of [-0.28, 0.28]) cylinder(0.035, 0.035, 0.12, brass, x, 1.67, z, 16, barrel);
  }
  cylinder(0.105, 0.12, 0.11, brass, 0.07, 1.75, 0.04, 6, barrel);
  cylinder(0.073, 0.073, 0.24, porcelain, 0.07, 1.91, 0.04, 20, barrel);
  cylinder(0.09, 0.1, 0.14, dark, 0.07, 2.08, 0.04, 24, barrel);
  axialCylinder(0.12, 0.12, 0.18, brass, new THREE.Vector3(0.43, 1.46, -0.02), new THREE.Vector3(1, 0.25, 0));
  axialCylinder(0.1, 0.1, 0.25, rubber, new THREE.Vector3(0.61, 1.52, -0.02), new THREE.Vector3(1, 0.25, 0));

  // Side covers: AM6 has its broad clutch cover on the left, while D50's larger cover sits opposite.
  if (derbi) {
    frontDisc(0.65, 0.075, machined, 0.63, -0.23, 0.49);
    frontDisc(0.59, 0.11, dark, 0.63, -0.23, 0.55);
    frontDisc(0.23, 0.045, alloy, 0.63, -0.23, 0.66);
    frontDisc(0.42, 0.08, machined, -0.74, -0.17, 0.49);
    frontDisc(0.36, 0.1, dark, -0.74, -0.17, 0.55);
    frontDisc(0.2, 0.045, alloy, -0.74, -0.17, 0.66);
    // D50 water pump housing and cast outlet.
    frontDisc(0.25, 0.075, machined, 1.13, -0.51, 0.52);
    frontDisc(0.18, 0.07, dark, 1.13, -0.51, 0.61);
  } else {
    frontDisc(0.62, 0.08, machined, -0.72, -0.17, 0.49);
    frontDisc(0.56, 0.12, dark, -0.72, -0.17, 0.55);
    frontDisc(0.2, 0.045, alloy, -0.72, -0.17, 0.67);
    frontDisc(0.48, 0.075, machined, 0.62, -0.22, 0.49);
    frontDisc(0.42, 0.1, alloy, 0.62, -0.22, 0.55);
    frontDisc(0.21, 0.05, dark, 0.62, -0.22, 0.66);
    frontDisc(0.2, 0.075, machined, 1.14, -0.48, 0.5);
    frontDisc(0.13, 0.07, dark, 1.14, -0.48, 0.59);
  }

  // Intake block, rubber coupling and compact carburetor behind the barrel.
  solid(roundedShape(0.48, 0.44, 0.1), 0.42, alloy, -1.21, 0.28, -0.23, 0.045);
  axialCylinder(0.19, 0.18, 0.32, rubber, new THREE.Vector3(-1.49, 0.32, -0.05), new THREE.Vector3(-1, 0.12, 0));
  axialCylinder(0.22, 0.2, 0.42, machined, new THREE.Vector3(-1.84, 0.38, -0.05), new THREE.Vector3(-1, 0.12, 0));
  axialCylinder(0.23, 0.23, 0.16, dark, new THREE.Vector3(-2.12, 0.42, -0.05), new THREE.Vector3(-1, 0.12, 0));
  solid(roundedShape(0.32, 0.34, 0.09), 0.3, dark, -1.83, 0.12, 0.02, 0.035);
  axialCylinder(0.08, 0.08, 0.23, brass, new THREE.Vector3(-1.83, 0.15, 0.18), new THREE.Vector3(0, 0, 1));

  // Exhaust flange and a short spigot remain visible; no oversized expansion chamber is attached.
  frontDisc(0.27, 0.075, machined, 0.83, 0.43, 0.47);
  frontDisc(0.2, 0.07, dark, 0.83, 0.43, 0.56);
  axialCylinder(0.17, 0.2, 0.38, alloy, new THREE.Vector3(1.03, 0.44, 0.15), new THREE.Vector3(1, 0.1, 0));

  // Mounting lugs, cast ribs and the kick-start lever add the recognizable hardware silhouette.
  solid(roundedShape(0.52, 0.3, 0.1), 0.65, alloy, -0.92, -0.95, -0.31, 0.035).rotation.z = -0.13;
  solid(roundedShape(0.56, 0.3, 0.1), 0.65, alloy, 0.93, -0.9, -0.31, 0.035).rotation.z = 0.12;
  for (const x of [-0.92, 0.93]) frontDisc(0.095, 0.08, dark, x, -0.95, 0.36);
  const kickPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.18, -0.27, 0.4), new THREE.Vector3(-1.38, -0.2, 0.4),
    new THREE.Vector3(-1.45, 0.42, 0.4), new THREE.Vector3(-1.9, 0.49, 0.4),
  ]);
  const kick = new THREE.Mesh(new THREE.TubeGeometry(kickPath, 32, 0.045, 10, false), machined);
  model.add(kick);
  axialCylinder(0.075, 0.075, 0.28, rubber, new THREE.Vector3(-2.02, 0.5, 0.4), new THREE.Vector3(-1, 0, 0));

  // Visible machined bolts around each cover and along the cylinder/head joint.
  const boltRing = (x: number, y: number, radius: number, count: number, z: number) => {
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      frontDisc(0.039, 0.035, machined, x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, z);
    }
  };
  if (derbi) {
    boltRing(0.63, -0.23, 0.54, 8, 0.65);
    boltRing(-0.74, -0.17, 0.32, 6, 0.64);
  } else {
    boltRing(-0.72, -0.17, 0.5, 8, 0.65);
    boltRing(0.62, -0.22, 0.36, 6, 0.64);
  }
  for (const [x, y] of [[-1.2, 0.49], [-0.35, 0.52], [0.32, 0.52], [1.16, 0.12], [-1.12, -0.6], [0.2, -0.72]] as const) {
    frontDisc(0.045, 0.04, machined, x, y, 0.53);
  }

  model.rotation.y = -0.28;
  return model;
}

export default function SetupEngineModel3D({ engine }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setError(true);
      return;
    }
    setError(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x101214, 1);
    host.replaceChildren(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", `Obracający się model silnika ${engine}`);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101214);
    scene.fog = new THREE.Fog(0x101214, 10, 24);
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 50);
    camera.position.set(3.9, 2.9, 6.6);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.25;
    controls.minDistance = 4.3;
    controls.maxDistance = 13;
    controls.target.set(-0.15, 0.5, 0);

    scene.add(new THREE.HemisphereLight(0xe4ebf2, 0x292522, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(4, 7, 6);
    scene.add(key);
    const edge = new THREE.DirectionalLight(0xb2c9e7, 2.2);
    edge.position.set(-5, 2, -4);
    scene.add(edge);
    const redFill = new THREE.PointLight(0xef4444, 18, 9);
    redFill.position.set(-3, 0.2, 3.2);
    scene.add(redFill);

    const engineModel = makeEngine(engine);
    scene.add(engineModel);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(3.2, 72), new THREE.MeshStandardMaterial({ color: 0x171a1c, metalness: 0.2, roughness: 0.8 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(-0.15, -1.24, 0);
    scene.add(ground);
    const grid = new THREE.GridHelper(10, 24, 0x3f4244, 0x242729);
    grid.position.y = -1.23;
    scene.add(grid);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    let animationId = 0;
    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      const elapsed = clock.getDelta();
      controls.update(elapsed);
      renderer.render(scene, camera);
    };
    const clock = new THREE.Clock();
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [engine]);

  return <div className="relative h-[310px] overflow-hidden rounded-2xl bg-[#101214] sm:h-[390px]" aria-label={`Model 3D ${engine}`}>
    <div ref={hostRef} className="absolute inset-0" />
    {error && <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-zinc-400">Ta przeglądarka nie udostępnia WebGL. Spróbuj otworzyć podsumowanie na urządzeniu z akceleracją 3D.</div>}
    <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-200">{engine} · model poglądowy 360°</span>
    <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[9px] text-zinc-500">Przeciągnij, aby obrócić · kółko, aby przybliżyć</span>
  </div>;
}
