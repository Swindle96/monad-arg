"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type AnomalySceneProps = { className?: string };

export default function AnomalyScene({ className = "" }: AnomalySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── Renderer ────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    /* ── Scene & Camera ──────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07040f, 0.048);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 0.4, 9);

    /* ── Monad brand lights ──────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x4433cc, 0.6));

    const purpleKey = new THREE.PointLight(0x6E54FF, 14, 30);
    purpleKey.position.set(-4, 4, 6);
    scene.add(purpleKey);

    const cyanFill = new THREE.PointLight(0x85E6FF, 9, 25);
    cyanFill.position.set(5, -2, 5);
    scene.add(cyanFill);

    const pinkRim = new THREE.PointLight(0xFF8EE4, 7, 20);
    pinkRim.position.set(0, 6, -4);
    scene.add(pinkRim);

    /* ── Central portal orb ─────────────────────────────────── */
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);
    orbGroup.position.set(0, 0, -1);

    const orbCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 2),
      new THREE.MeshStandardMaterial({
        color: 0x6E54FF, emissive: 0x2a1a88, emissiveIntensity: 0.8,
        metalness: 0.7, roughness: 0.12, wireframe: false,
      }),
    );
    orbGroup.add(orbCore);

    const orbWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.94, 2),
      new THREE.MeshBasicMaterial({ color: 0x85E6FF, wireframe: true, transparent: true, opacity: 0.22 }),
    );
    orbGroup.add(orbWire);

    /* ── Particle field ──────────────────────────────────────── */
    const N = 1600;
    const pGeo = new THREE.BufferGeometry();
    const pos  = new Float32Array(N * 3);
    const col  = new Float32Array(N * 3);
    const colA = new THREE.Color(0x6E54FF);
    const colB = new THREE.Color(0x85E6FF);
    const colC = new THREE.Color(0xFF8EE4);

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      pos[i3]     = (Math.random() - 0.5) * 18;
      pos[i3 + 1] = (Math.random() - 0.5) * 10;
      pos[i3 + 2] = -Math.random() * 12;
      const t = Math.random();
      const c = t < 0.5
        ? colA.clone().lerp(colB, t * 2)
        : colB.clone().lerp(colC, (t - 0.5) * 2);
      col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color",    new THREE.BufferAttribute(col, 3));

    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size:         0.03,
      vertexColors: true,
      transparent:  true,
      opacity:      0.72,
      depthWrite:   false,
      sizeAttenuation: true,
    }));
    scene.add(particles);

    /* ── Floating geometric shards ───────────────────────────── */
    const shardGroup = new THREE.Group();
    scene.add(shardGroup);

    const shardMats = [
      new THREE.MeshBasicMaterial({ color: 0x6E54FF, transparent: true, opacity: 0.18, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0x85E6FF, transparent: true, opacity: 0.14, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0xFF8EE4, transparent: true, opacity: 0.12, wireframe: true }),
    ];
    const shardGeos = [
      new THREE.OctahedronGeometry(0.4),
      new THREE.TetrahedronGeometry(0.35),
      new THREE.IcosahedronGeometry(0.28),
    ];

    for (let i = 0; i < 28; i++) {
      const geo  = shardGeos[i % 3].clone();
      const mat  = shardMats[i % 3];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) *  7,
        -1.5 - Math.random() * 8,
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      mesh.scale.setScalar(0.5 + Math.random() * 1.2);
      shardGroup.add(mesh);
    }

    /* ── Grid floor ──────────────────────────────────────────── */
    const grid = new THREE.GridHelper(16, 36, 0x6E54FF, 0x1a0d44);
    grid.position.set(0, -2.4, -2);
    grid.rotation.x = Math.PI * 0.06;
    scene.add(grid);

    /* ── Ring portal ─────────────────────────────────────────── */
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ringGroup.position.set(0, 0, -3);

    for (let i = 0; i < 3; i++) {
      const r = 3.2 + i * 0.55;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.012, 6, 120),
        new THREE.MeshBasicMaterial({
          color: [0x6E54FF, 0x85E6FF, 0xFF8EE4][i],
          transparent: true,
          opacity: 0.35 - i * 0.08,
        }),
      );
      ring.rotation.x = Math.PI / 2 + (i * 0.15);
      ringGroup.add(ring);
    }

    /* ── Monad logo (3-D squircle ring) ─────────────────────── */
    function traceSquircle(path: THREE.Path | THREE.Shape, half: number, r: number) {
      path.moveTo(-half + r, -half);
      path.lineTo( half - r, -half);
      path.quadraticCurveTo( half, -half,  half, -half + r);
      path.lineTo( half,  half - r);
      path.quadraticCurveTo( half,  half,  half - r,  half);
      path.lineTo(-half + r,  half);
      path.quadraticCurveTo(-half,  half, -half,  half - r);
      path.lineTo(-half, -half + r);
      path.quadraticCurveTo(-half, -half, -half + r, -half);
    }

    const logoShape = new THREE.Shape();
    traceSquircle(logoShape, 0.78, 0.32);
    const logoHole = new THREE.Path();
    traceSquircle(logoHole, 0.50, 0.21);
    logoShape.holes.push(logoHole);

    const logoGeo = new THREE.ExtrudeGeometry(logoShape, {
      depth: 0.18,
      bevelEnabled:   true,
      bevelSegments:  5,
      bevelSize:      0.034,
      bevelThickness: 0.034,
    });
    logoGeo.computeBoundingBox();
    const logoCenter = new THREE.Vector3();
    logoGeo.boundingBox!.getCenter(logoCenter);
    logoGeo.translate(-logoCenter.x, -logoCenter.y, -logoCenter.z);

    const logoMat = new THREE.MeshStandardMaterial({
      color:             0xffffff,
      emissive:          0xb0a0ff,
      emissiveIntensity: 0.45,
      metalness:         0.6,
      roughness:         0.06,
    });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);

    /* outer glow torus */
    const glowGeo  = new THREE.TorusGeometry(1.08, 0.016, 6, 80);
    const glowMat  = new THREE.MeshBasicMaterial({ color: 0x6E54FF, transparent: true, opacity: 0.55 });
    const glowRing = new THREE.Mesh(glowGeo, glowMat);

    /* secondary glow torus */
    const glowGeo2  = new THREE.TorusGeometry(1.22, 0.009, 6, 80);
    const glowMat2  = new THREE.MeshBasicMaterial({ color: 0x85E6FF, transparent: true, opacity: 0.28 });
    const glowRing2 = new THREE.Mesh(glowGeo2, glowMat2);

    const logoGroup = new THREE.Group();
    logoGroup.add(logoMesh);
    logoGroup.add(glowRing);
    logoGroup.add(glowRing2);
    logoGroup.position.set(0, 0, 2);
    logoGroup.rotation.z = Math.PI / 4;
    scene.add(logoGroup);

    /* ── Pointer tracking ────────────────────────────────────── */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      pointer.ty = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointerMove);

    /* ── Resize ──────────────────────────────────────────────── */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(mount);

    /* ── Animation loop ──────────────────────────────────────── */
    let frame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const t    = clock.getElapsedTime();
      const pulse = Math.sin(t * 2.2) * 0.5 + 0.5;

      /* lerp pointer */
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      /* orb */
      orbGroup.rotation.y = t * 0.18 + pointer.x * 0.12;
      orbGroup.rotation.x = pointer.y * 0.08;
      orbCore.scale.setScalar(1 + pulse * 0.04);
      (orbWire.material as THREE.MeshBasicMaterial).opacity = 0.14 + pulse * 0.12;

      /* lights pulse */
      purpleKey.intensity = 12 + pulse * 4;
      cyanFill.intensity  = 7  + (1 - pulse) * 4;
      pinkRim.intensity   = 5  + pulse * 3;

      /* particles */
      particles.rotation.y = t * 0.022;
      particles.rotation.x = Math.sin(t * 0.17) * 0.04;

      /* shards */
      shardGroup.rotation.y = -t * 0.07;
      shardGroup.children.forEach((c, i) => {
        c.rotation.z += 0.003 + i * 0.0001;
        c.rotation.x += 0.002;
      });

      /* rings */
      ringGroup.rotation.z = t * 0.12;
      ringGroup.children.forEach((r, i) => {
        (r as THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>).material.opacity =
          (0.35 - i * 0.08) * (0.6 + pulse * 0.4);
      });

      /* monad logo — slow coin-flip + float + parallax */
      logoGroup.rotation.y = Math.sin(t * 0.38) * 0.55 + pointer.x * 0.28;
      logoGroup.rotation.x = Math.cos(t * 0.27) * 0.09 + pointer.y * 0.14;
      logoGroup.rotation.z = Math.PI / 4 + Math.sin(t * 0.19) * 0.04;
      logoGroup.position.y = Math.sin(t * 0.62) * 0.2;
      logoMat.emissiveIntensity = 0.35 + pulse * 0.35;
      glowMat.opacity  = 0.38 + pulse * 0.28;
      glowMat2.opacity = 0.18 + (1 - pulse) * 0.18;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      obs.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) { m.forEach(x => x.dispose()); } else { m.dispose(); }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`rift-canvas pointer-events-auto absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
}
