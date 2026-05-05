"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/* ── Inline shaders ────────────────────────────────────────────── */

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    darkness: { value: 1.25 },
    offset:   { value: 0.88 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    varying vec2 vUv;
    void main() {
      vec4 col = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * offset;
      float vig = clamp(dot(uv, uv) * darkness, 0.0, 1.0);
      gl_FragColor = vec4(col.rgb * (1.0 - vig), col.a);
    }
  `,
};

// Fresnel + animated noise shader for the portal orb
const OrbShader = {
  uniforms: {
    time:           { value: 0 },
    colorA:         { value: new THREE.Color(0x6E54FF) },
    colorB:         { value: new THREE.Color(0x85E6FF) },
    hoverIntensity: { value: 0 },
    clickPulse:     { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    void main() {
      vNormal   = normalize(normalMatrix * normal);
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3  colorA;
    uniform vec3  colorB;
    uniform float hoverIntensity;
    uniform float clickPulse;
    varying vec3  vNormal;
    varying vec3  vWorldPos;

    float rand(vec2 st) {
      return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
    }
    float noise(vec2 st) {
      vec2 i = floor(st); vec2 f = fract(st);
      float a = rand(i), b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0)), d = rand(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = pow(1.0 - clamp(dot(viewDir, vNormal), 0.0, 1.0), 2.5);
      float n = noise(vNormal.xy * 5.0 + time * 0.25);
      vec3 col = mix(colorA, colorB, n * 0.5 + fresnel * 0.5);
      float bright = 0.75 + fresnel * 1.5 + n * 0.22
                   + hoverIntensity * 0.9
                   + clickPulse * 2.5;
      gl_FragColor = vec4(col * bright, 1.0);
    }
  `,
};

// Perspective grid shader — replaces GridHelper
const GridShader = {
  uniforms: {
    time:    { value: 0 },
    colorA:  { value: new THREE.Color(0x6E54FF) },
    colorB:  { value: new THREE.Color(0x150a30) },
  },
  vertexShader: `
    varying vec2 vXZ;
    varying float vDepth;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vXZ = worldPos.xz;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vDepth = clamp(-mvPos.z / 20.0, 0.0, 1.0);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3  colorA;
    uniform vec3  colorB;
    varying vec2  vXZ;
    varying float vDepth;

    float gridLine(vec2 uv, float cell, float lw) {
      vec2 g = abs(fract(uv / cell) - 0.5);
      return 1.0 - smoothstep(0.0, lw, min(g.x, g.y));
    }

    void main() {
      float fine   = gridLine(vXZ, 0.5,  0.028);
      float coarse = gridLine(vXZ, 2.5,  0.05) * 0.55;
      float strength = max(fine, coarse);

      float dist  = length(vXZ);
      float pulse = sin(dist * 0.6 - time * 1.6) * 0.5 + 0.5;

      vec3 col = mix(colorB, colorA, fine * (0.45 + pulse * 0.55));
      float a  = strength * (1.0 - vDepth) * 0.65;
      if (a < 0.01) discard;
      gl_FragColor = vec4(col, a);
    }
  `,
};

type AnomalySceneProps = { className?: string };

export default function AnomalyScene({ className = "" }: AnomalySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sceneError, setSceneError] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    try {
      const isMobile            = /iPhone|iPad|Android/i.test(navigator.userAgent);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

      /* ── Monad brand lights (three-point setup) ──────────────── */
      scene.add(new THREE.AmbientLight(0x4433cc, 0.5));

      // Key: strong purple from upper-left
      const purpleKey = new THREE.PointLight(0x6E54FF, 16, 32);
      purpleKey.position.set(-4, 5, 6);
      scene.add(purpleKey);

      // Fill: soft cyan from lower-right
      const cyanFill = new THREE.PointLight(0x85E6FF, 8, 28);
      cyanFill.position.set(5, -2, 4);
      scene.add(cyanFill);

      // Rim: pink back-light for silhouette separation
      const pinkRim = new THREE.PointLight(0xFF8EE4, 7, 22);
      pinkRim.position.set(2, 7, -5);
      scene.add(pinkRim);

      // Logo spot: tightly focused cyan from above-front
      const logoSpot = new THREE.SpotLight(0x85E6FF, 10, 18, Math.PI / 7, 0.45, 1.5);
      logoSpot.position.set(0, 4, 5);
      scene.add(logoSpot);

      /* ── Central portal orb ─────────────────────────────────── */
      const orbGroup = new THREE.Group();
      scene.add(orbGroup);
      orbGroup.position.set(0, 0, -1);

      const orbMat = new THREE.ShaderMaterial({
        uniforms: {
          time:           { value: 0 },
          colorA:         { value: new THREE.Color(0x6E54FF) },
          colorB:         { value: new THREE.Color(0x85E6FF) },
          hoverIntensity: { value: 0 },
          clickPulse:     { value: 0 },
        },
        vertexShader:   OrbShader.vertexShader,
        fragmentShader: OrbShader.fragmentShader,
      });
      const orbCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 2), orbMat);
      orbGroup.add(orbCore);

      const orbWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.94, 2),
        new THREE.MeshBasicMaterial({ color: 0x85E6FF, wireframe: true, transparent: true, opacity: 0.22 }),
      );
      orbGroup.add(orbWire);

      /* ── Particle field ──────────────────────────────────────── */
      const N = isMobile ? 600 : 1400;
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
        size: 0.03, vertexColors: true, transparent: true,
        opacity: 0.72, depthWrite: false, sizeAttenuation: true,
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
        const mesh = new THREE.Mesh(shardGeos[i % 3].clone(), shardMats[i % 3]);
        mesh.position.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 7,
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

      /* ── Perspective grid (replaces GridHelper) ──────────────── */
      const gridMat = new THREE.ShaderMaterial({
        uniforms: {
          time:   { value: 0 },
          colorA: { value: new THREE.Color(0x6E54FF) },
          colorB: { value: new THREE.Color(0x150a30) },
        },
        vertexShader:   GridShader.vertexShader,
        fragmentShader: GridShader.fragmentShader,
        transparent:    true,
        depthWrite:     false,
        side:           THREE.DoubleSide,
      });
      const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(40, 40, 1, 1), gridMat);
      gridMesh.rotation.x = -Math.PI / 2 + Math.PI * 0.06;
      gridMesh.position.set(0, -2.4, -5);
      scene.add(gridMesh);

      /* ── Ring portal ─────────────────────────────────────────── */
      const ringGroup = new THREE.Group();
      scene.add(ringGroup);
      ringGroup.position.set(0, 0, -3);

      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(3.2 + i * 0.55, 0.012, 6, 120),
          new THREE.MeshBasicMaterial({
            color: [0x6E54FF, 0x85E6FF, 0xFF8EE4][i],
            transparent: true,
            opacity: 0.35 - i * 0.08,
          }),
        );
        ring.rotation.x = Math.PI / 2 + i * 0.15;
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
        depth: 0.18, bevelEnabled: true, bevelSegments: 5,
        bevelSize: 0.034, bevelThickness: 0.034,
      });
      logoGeo.computeBoundingBox();
      const logoCenter = new THREE.Vector3();
      logoGeo.boundingBox!.getCenter(logoCenter);
      logoGeo.translate(-logoCenter.x, -logoCenter.y, -logoCenter.z);

      const logoMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xb0a0ff, emissiveIntensity: 0.45,
        metalness: 0.6, roughness: 0.06,
      });
      const logoMesh = new THREE.Mesh(logoGeo, logoMat);

      const glowMat  = new THREE.MeshBasicMaterial({ color: 0x6E54FF, transparent: true, opacity: 0.55 });
      const glowRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.016, 6, 80), glowMat);
      const glowMat2  = new THREE.MeshBasicMaterial({ color: 0x85E6FF, transparent: true, opacity: 0.28 });
      const glowRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.009, 6, 80), glowMat2);

      const logoGroup = new THREE.Group();
      logoGroup.add(logoMesh, glowRing, glowRing2);
      logoGroup.position.set(0, 0, 2);
      logoGroup.rotation.z = Math.PI / 4;
      scene.add(logoGroup);

      // Aim logo spotlight at logo group
      logoSpot.target = logoGroup;
      scene.add(logoSpot.target);

      /* ── Post-processing ─────────────────────────────────────── */
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      let bloomPass: UnrealBloomPass | null = null;
      if (!isMobile) {
        bloomPass = new UnrealBloomPass(
          new THREE.Vector2(mount.clientWidth || 1, mount.clientHeight || 1),
          0.75, 0.4, 0.15,
        );
        composer.addPass(bloomPass);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composer.addPass(new ShaderPass(VignetteShader as any));

      /* ── Raycaster (interaction) ─────────────────────────────── */
      const raycaster  = new THREE.Raycaster();
      const mouse2D    = new THREE.Vector2();
      let hoverIntensity = 0;   // 0–1, lerped toward target
      let clickPulse     = 0;   // 0–1, decays each frame
      const interactMeshes = [orbCore, logoMesh];

      const onPointerClick = (e: MouseEvent) => {
        const rect = mount.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        const my = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
        if (raycaster.intersectObjects(interactMeshes, false).length > 0) {
          clickPulse = 1.0;
        }
      };
      mount.addEventListener("click", onPointerClick);

      /* ── Pointer tracking ────────────────────────────────────── */
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointerMove = (e: PointerEvent) => {
        const rect = mount.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointer.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        pointer.ty = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        mouse2D.x = pointer.tx;
        mouse2D.y = pointer.ty;
      };
      mount.addEventListener("pointermove", onPointerMove);

      /* ── Resize ──────────────────────────────────────────────── */
      const resize = () => {
        const w = mount.clientWidth || 1;
        const h = mount.clientHeight || 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        if (bloomPass) bloomPass.resolution.set(w, h);
      };
      resize();
      const obs = new ResizeObserver(resize);
      obs.observe(mount);

      /* ── Animation loop ──────────────────────────────────────── */
      let frame = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        const t     = clock.getElapsedTime();
        const pulse = Math.sin(t * 2.2) * 0.5 + 0.5;

        /* pointer lerp */
        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;

        /* raycaster hover */
        raycaster.setFromCamera(mouse2D, camera);
        const isHovered = raycaster.intersectObjects(interactMeshes, false).length > 0;
        hoverIntensity += ((isHovered ? 1 : 0) - hoverIntensity) * 0.07;
        clickPulse     *= 0.88; // decay

        /* orb */
        orbMat.uniforms.time.value           = t;
        orbMat.uniforms.hoverIntensity.value = hoverIntensity;
        orbMat.uniforms.clickPulse.value     = clickPulse;
        orbGroup.rotation.y = t * 0.18 + pointer.x * 0.12;
        orbGroup.rotation.x = pointer.y * 0.08;
        orbCore.scale.setScalar(1 + pulse * 0.04 + clickPulse * 0.18);
        (orbWire.material as THREE.MeshBasicMaterial).opacity = 0.14 + pulse * 0.12 + hoverIntensity * 0.1;

        /* lights pulse */
        purpleKey.intensity = 14 + pulse * 4 + clickPulse * 8;
        cyanFill.intensity  = 7  + (1 - pulse) * 4;
        pinkRim.intensity   = 5  + pulse * 3;
        logoSpot.intensity  = 8  + hoverIntensity * 6 + clickPulse * 12;

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
            (0.35 - i * 0.08) * (0.6 + pulse * 0.4 + clickPulse * 0.3);
        });

        /* grid */
        gridMat.uniforms.time.value = t;

        /* logo */
        logoGroup.rotation.y = Math.sin(t * 0.38) * 0.55 + pointer.x * 0.28;
        logoGroup.rotation.x = Math.cos(t * 0.27) * 0.09 + pointer.y * 0.14;
        logoGroup.rotation.z = Math.PI / 4 + Math.sin(t * 0.19) * 0.04;
        logoGroup.position.y = Math.sin(t * 0.62) * 0.2;
        logoMat.emissiveIntensity = 0.35 + pulse * 0.35 + hoverIntensity * 0.5 + clickPulse * 1.2;
        glowMat.opacity  = 0.38 + pulse * 0.28 + hoverIntensity * 0.2;
        glowMat2.opacity = 0.18 + (1 - pulse) * 0.18;

        /* bloom boost on click */
        if (bloomPass) {
          bloomPass.strength = 0.75 + clickPulse * 1.2 + hoverIntensity * 0.25;
        }

        composer.render();
        if (!prefersReducedMotion) frame = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        cancelAnimationFrame(frame);
        obs.disconnect();
        mount.removeEventListener("pointermove", onPointerMove);
        mount.removeEventListener("click", onPointerClick);
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        scene.traverse(obj => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
            obj.geometry.dispose();
            const m = obj.material;
            if (Array.isArray(m)) { m.forEach(x => x.dispose()); } else { m.dispose(); }
          }
        });
        gridMat.dispose();
        composer.dispose();
        renderer.dispose();
      };
    } catch (e) {
      console.error("[AnomalyScene]", e);
      setSceneError(true);
    }
  }, []);

  if (sceneError) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(110,84,255,0.12), transparent 70%)" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={mountRef}
      className={`rift-canvas pointer-events-auto absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
}
