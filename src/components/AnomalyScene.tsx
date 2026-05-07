"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/* ── Post-processing shaders ────────────────────────────────────── */

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    darkness: { value: 1.35 },
    offset:   { value: 0.85 },
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

/* Chromatic aberration — radial RGB split */
const ChromaticShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    amount:   { value: 0.0028 },
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
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - 0.5;
      float d = length(dir);
      float r = texture2D(tDiffuse, vUv - dir * amount * d * 2.0).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + dir * amount * d * 2.0).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

/* Orb surface shader — fresnel + animated Voronoi noise */
const OrbShader = {
  uniforms: {
    time:           { value: 0 },
    colorA:         { value: new THREE.Color(0x6E54FF) },
    colorB:         { value: new THREE.Color(0x85E6FF) },
    colorC:         { value: new THREE.Color(0xFF8EE4) },
    hoverIntensity: { value: 0 },
    clickPulse:     { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    void main() {
      vNormal   = normalize(normalMatrix * normal);
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3  colorA;
    uniform vec3  colorB;
    uniform vec3  colorC;
    uniform float hoverIntensity;
    uniform float clickPulse;
    varying vec3  vNormal;
    varying vec3  vWorldPos;
    varying vec2  vUv;

    float rand(vec2 st) {
      return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
    }
    float noise(vec2 st) {
      vec2 i = floor(st); vec2 f = fract(st);
      float a = rand(i), b = rand(i+vec2(1.0,0.0));
      float c = rand(i+vec2(0.0,1.0)), d = rand(i+vec2(1.0,1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
    }
    float fbm(vec2 st) {
      float v=0.0; float a=0.5;
      for(int i=0;i<4;i++){v+=a*noise(st);st*=2.0;a*=0.5;}
      return v;
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = pow(1.0 - clamp(dot(viewDir, vNormal), 0.0, 1.0), 2.2);

      float n1 = fbm(vNormal.xy * 4.5 + time * 0.18);
      float n2 = fbm(vNormal.yz * 3.8 - time * 0.12);
      float n  = mix(n1, n2, 0.45);

      float t = n * 0.6 + fresnel * 0.4;
      vec3 col;
      if (t < 0.5) col = mix(colorA, colorB, t * 2.0);
      else         col = mix(colorB, colorC, (t - 0.5) * 2.0);

      float bright = 0.65 + fresnel * 1.45 + n * 0.25
                   + hoverIntensity * 1.0
                   + clickPulse * 2.8;
      gl_FragColor = vec4(col * bright, 1.0);
    }
  `,
};

/* Hex grid shader — replaces GridHelper */
const GridShader = {
  uniforms: {
    time:   { value: 0 },
    colorA: { value: new THREE.Color(0x6E54FF) },
    colorB: { value: new THREE.Color(0x0C0818) },
  },
  vertexShader: `
    varying vec2 vXZ;
    varying float vDepth;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vXZ = worldPos.xz;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vDepth = clamp(-mvPos.z / 22.0, 0.0, 1.0);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3  colorA;
    uniform vec3  colorB;
    varying vec2  vXZ;
    varying float vDepth;

    float hexDist(vec2 p) {
      p = abs(p);
      return max(dot(p, normalize(vec2(1.0, 1.732))), p.x);
    }
    float hexGrid(vec2 uv, float size) {
      vec2 r = vec2(1.0, 1.732) * size;
      vec2 h = r * 0.5;
      vec2 a = mod(uv, r) - h;
      vec2 b = mod(uv - h, r) - h;
      float da = hexDist(a);
      float db = hexDist(b);
      float d = min(da, db);
      return 1.0 - smoothstep(size * 0.42, size * 0.46, d);
    }

    void main() {
      float coarse = hexGrid(vXZ, 2.4) * 0.7;
      float fine   = hexGrid(vXZ, 0.7) * 0.35;
      float s = max(coarse, fine);

      float dist  = length(vXZ);
      float pulse = sin(dist * 0.55 - time * 1.5) * 0.5 + 0.5;

      vec3 col = mix(colorB, colorA, coarse * (0.4 + pulse * 0.6));
      float a  = s * (1.0 - vDepth) * 0.7;
      if (a < 0.01) discard;
      gl_FragColor = vec4(col, a);
    }
  `,
};

/* DNA data-helix shader — instanced rings circling the orb */
const HelixShader = {
  uniforms: {
    time:  { value: 0 },
    color: { value: new THREE.Color(0x85E6FF) },
  },
  vertexShader: `
    attribute float phase;
    attribute float radius;
    uniform float time;
    varying float vAlpha;
    void main() {
      float angle = phase + time * 0.55;
      vec3 pos = position;
      pos.x += cos(angle) * radius;
      pos.z += sin(angle) * radius;
      vAlpha = 0.35 + 0.35 * sin(phase * 3.0 + time);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 2.5;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      if (d > 1.0) discard;
      gl_FragColor = vec4(color, vAlpha * (1.0 - d * d));
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
      const isMobile             = /iPhone|iPad|Android/i.test(navigator.userAgent);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* ── Renderer ────────────────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping      = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      mount.appendChild(renderer.domElement);

      /* ── Scene ───────────────────────────────────────────────── */
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x030108, 0.042);

      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 130);
      camera.position.set(0, 0.6, 9.5);

      /* ── Lights ──────────────────────────────────────────────── */
      scene.add(new THREE.AmbientLight(0x3322AA, 0.55));

      const purpleKey = new THREE.PointLight(0x6E54FF, 18, 34);
      purpleKey.position.set(-4.5, 5.5, 6);
      scene.add(purpleKey);

      const cyanFill = new THREE.PointLight(0x85E6FF, 9, 30);
      cyanFill.position.set(5.5, -2, 4);
      scene.add(cyanFill);

      const pinkRim = new THREE.PointLight(0xFF8EE4, 7, 24);
      pinkRim.position.set(2, 7.5, -6);
      scene.add(pinkRim);

      const amberAccent = new THREE.PointLight(0xD4A574, 5, 18);
      amberAccent.position.set(-5, -3, 3);
      scene.add(amberAccent);

      const logoSpot = new THREE.SpotLight(0x85E6FF, 12, 20, Math.PI / 7, 0.4, 1.5);
      logoSpot.position.set(0, 4.5, 5.5);
      scene.add(logoSpot);

      /* ── Central portal orb ──────────────────────────────────── */
      const orbGroup = new THREE.Group();
      scene.add(orbGroup);
      orbGroup.position.set(0, 0, -1);

      const orbMat = new THREE.ShaderMaterial({
        uniforms: {
          time:           { value: 0 },
          colorA:         { value: new THREE.Color(0x6E54FF) },
          colorB:         { value: new THREE.Color(0x85E6FF) },
          colorC:         { value: new THREE.Color(0xFF8EE4) },
          hoverIntensity: { value: 0 },
          clickPulse:     { value: 0 },
        },
        vertexShader:   OrbShader.vertexShader,
        fragmentShader: OrbShader.fragmentShader,
      });

      const orbCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 3), orbMat);
      orbGroup.add(orbCore);

      const orbWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.0, 2),
        new THREE.MeshBasicMaterial({ color: 0x85E6FF, wireframe: true, transparent: true, opacity: 0.18 }),
      );
      orbGroup.add(orbWire);

      /* Inner glow sphere */
      const innerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x6E54FF, transparent: true, opacity: 0.12, side: THREE.BackSide }),
      );
      orbGroup.add(innerGlow);

      /* ── Data helix around orb ───────────────────────────────── */
      const HELIX_N = isMobile ? 80 : 180;
      const helixGeo = new THREE.BufferGeometry();
      const hPos   = new Float32Array(HELIX_N * 3);
      const hPhase = new Float32Array(HELIX_N);
      const hRad   = new Float32Array(HELIX_N);

      for (let i = 0; i < HELIX_N; i++) {
        const t = i / HELIX_N;
        hPos[i * 3    ] = 0;
        hPos[i * 3 + 1] = (t - 0.5) * 5.5;
        hPos[i * 3 + 2] = 0;
        hPhase[i] = t * Math.PI * 6;
        hRad[i]   = 1.4 + 0.4 * Math.sin(t * Math.PI * 4);
      }
      helixGeo.setAttribute("position", new THREE.BufferAttribute(hPos, 3));
      helixGeo.setAttribute("phase",    new THREE.BufferAttribute(hPhase, 1));
      helixGeo.setAttribute("radius",   new THREE.BufferAttribute(hRad, 1));

      const helixMat = new THREE.ShaderMaterial({
        uniforms: {
          time:  { value: 0 },
          color: { value: new THREE.Color(0x85E6FF) },
        },
        vertexShader:   HelixShader.vertexShader,
        fragmentShader: HelixShader.fragmentShader,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      });
      const helixStrand1 = new THREE.Points(helixGeo, helixMat);
      orbGroup.add(helixStrand1);

      /* Second helix strand — offset phase */
      const helix2Geo = helixGeo.clone();
      const h2Phase = new Float32Array(HELIX_N);
      for (let i = 0; i < HELIX_N; i++) h2Phase[i] = hPhase[i] + Math.PI;
      helix2Geo.setAttribute("phase", new THREE.BufferAttribute(h2Phase, 1));
      const helixMat2 = helixMat.clone();
      helixMat2.uniforms.color.value = new THREE.Color(0xD4A574);
      const helixStrand2 = new THREE.Points(helix2Geo, helixMat2);
      orbGroup.add(helixStrand2);

      /* ── Particle field ──────────────────────────────────────── */
      const N    = isMobile ? 700 : 1600;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(N * 3);
      const pCol = new Float32Array(N * 3);

      const cA = new THREE.Color(0x6E54FF);
      const cB = new THREE.Color(0x85E6FF);
      const cC = new THREE.Color(0xFF8EE4);
      const cD = new THREE.Color(0xD4A574);

      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        pPos[i3]     = (Math.random() - 0.5) * 20;
        pPos[i3 + 1] = (Math.random() - 0.5) * 11;
        pPos[i3 + 2] = -Math.random() * 14;
        const t = Math.random();
        let c: THREE.Color;
        if      (t < 0.35) c = cA.clone().lerp(cB, t * 2.86);
        else if (t < 0.65) c = cB.clone().lerp(cC, (t - 0.35) * 3.33);
        else               c = cC.clone().lerp(cD, (t - 0.65) * 2.86);
        pCol[i3] = c.r; pCol[i3 + 1] = c.g; pCol[i3 + 2] = c.b;
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute("color",    new THREE.BufferAttribute(pCol, 3));

      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.028, vertexColors: true,
        transparent: true, opacity: 0.7,
        depthWrite: false, sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      }));
      scene.add(particles);

      /* ── Floating shards ─────────────────────────────────────── */
      const shardGroup = new THREE.Group();
      scene.add(shardGroup);

      const shardMats = [
        new THREE.MeshBasicMaterial({ color: 0x6E54FF, transparent: true, opacity: 0.16, wireframe: true }),
        new THREE.MeshBasicMaterial({ color: 0x85E6FF, transparent: true, opacity: 0.12, wireframe: true }),
        new THREE.MeshBasicMaterial({ color: 0xFF8EE4, transparent: true, opacity: 0.10, wireframe: true }),
        new THREE.MeshBasicMaterial({ color: 0xD4A574, transparent: true, opacity: 0.10, wireframe: true }),
      ];
      const shardGeos = [
        new THREE.OctahedronGeometry(0.38),
        new THREE.TetrahedronGeometry(0.32),
        new THREE.IcosahedronGeometry(0.26),
        new THREE.DodecahedronGeometry(0.22),
      ];

      for (let i = 0; i < 32; i++) {
        const mesh = new THREE.Mesh(shardGeos[i % 4].clone(), shardMats[i % 4]);
        mesh.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 8,
          -1.5 - Math.random() * 9,
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.scale.setScalar(0.4 + Math.random() * 1.3);
        shardGroup.add(mesh);
      }

      /* ── Hex perspective grid ────────────────────────────────── */
      const gridMat = new THREE.ShaderMaterial({
        uniforms: {
          time:   { value: 0 },
          colorA: { value: new THREE.Color(0x6E54FF) },
          colorB: { value: new THREE.Color(0x0C0818) },
        },
        vertexShader:   GridShader.vertexShader,
        fragmentShader: GridShader.fragmentShader,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
      });
      const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(48, 48, 1, 1), gridMat);
      gridMesh.rotation.x = -Math.PI / 2 + Math.PI * 0.055;
      gridMesh.position.set(0, -2.6, -5.5);
      scene.add(gridMesh);

      /* ── Portal rings ────────────────────────────────────────── */
      const ringGroup = new THREE.Group();
      scene.add(ringGroup);
      ringGroup.position.set(0, 0, -3.5);

      const ringColors = [0x6E54FF, 0x85E6FF, 0xFF8EE4, 0xD4A574];
      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(3.4 + i * 0.6, 0.011, 6, 128),
          new THREE.MeshBasicMaterial({
            color: ringColors[i],
            transparent: true,
            opacity: 0.38 - i * 0.06,
          }),
        );
        ring.rotation.x = Math.PI / 2 + i * 0.12;
        ringGroup.add(ring);
      }

      /* ── Monad logo ──────────────────────────────────────────── */
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
      traceSquircle(logoShape, 0.80, 0.33);
      const logoHole = new THREE.Path();
      traceSquircle(logoHole, 0.52, 0.22);
      logoShape.holes.push(logoHole);

      const logoGeo = new THREE.ExtrudeGeometry(logoShape, {
        depth: 0.20, bevelEnabled: true, bevelSegments: 6,
        bevelSize: 0.036, bevelThickness: 0.036,
      });
      logoGeo.computeBoundingBox();
      const lc = new THREE.Vector3();
      logoGeo.boundingBox!.getCenter(lc);
      logoGeo.translate(-lc.x, -lc.y, -lc.z);

      const logoMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xAA99FF,
        emissiveIntensity: 0.55,
        metalness: 0.7,
        roughness: 0.05,
      });
      const logoMesh = new THREE.Mesh(logoGeo, logoMat);

      /* Glow rings around logo */
      const glow1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.014, 6, 80),
        new THREE.MeshBasicMaterial({ color: 0x6E54FF, transparent: true, opacity: 0.55 }),
      );
      const glow2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.28, 0.008, 6, 80),
        new THREE.MeshBasicMaterial({ color: 0x85E6FF, transparent: true, opacity: 0.28 }),
      );
      const glow3 = new THREE.Mesh(
        new THREE.TorusGeometry(1.42, 0.006, 6, 80),
        new THREE.MeshBasicMaterial({ color: 0xD4A574, transparent: true, opacity: 0.16 }),
      );

      const logoGroup = new THREE.Group();
      logoGroup.add(logoMesh, glow1, glow2, glow3);
      logoGroup.position.set(0, 0, 2.2);
      logoGroup.rotation.z = Math.PI / 4;
      scene.add(logoGroup);

      logoSpot.target = logoGroup;
      scene.add(logoSpot.target);

      /* ── Post-processing ─────────────────────────────────────── */
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      let bloomPass: UnrealBloomPass | null = null;
      if (!isMobile) {
        bloomPass = new UnrealBloomPass(
          new THREE.Vector2(mount.clientWidth || 1, mount.clientHeight || 1),
          0.85, 0.45, 0.12,
        );
        composer.addPass(bloomPass);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composer.addPass(new ShaderPass(ChromaticShader as any));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composer.addPass(new ShaderPass(VignetteShader as any));

      /* ── Raycaster / interaction ─────────────────────────────── */
      const raycaster = new THREE.Raycaster();
      const mouse2D   = new THREE.Vector2();
      let hoverIntensity = 0;
      let clickPulse     = 0;
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

      /* ── Animation ───────────────────────────────────────────── */
      let frame = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        const t     = clock.getElapsedTime();
        const pulse = Math.sin(t * 2.0) * 0.5 + 0.5;

        pointer.x += (pointer.tx - pointer.x) * 0.055;
        pointer.y += (pointer.ty - pointer.y) * 0.055;

        raycaster.setFromCamera(mouse2D, camera);
        const isHov = raycaster.intersectObjects(interactMeshes, false).length > 0;
        hoverIntensity += ((isHov ? 1 : 0) - hoverIntensity) * 0.07;
        clickPulse     *= 0.87;

        /* Orb */
        orbMat.uniforms.time.value           = t;
        orbMat.uniforms.hoverIntensity.value = hoverIntensity;
        orbMat.uniforms.clickPulse.value     = clickPulse;
        orbGroup.rotation.y = t * 0.16 + pointer.x * 0.14;
        orbGroup.rotation.x = pointer.y * 0.09;
        orbCore.scale.setScalar(1 + pulse * 0.05 + clickPulse * 0.20);
        (orbWire.material as THREE.MeshBasicMaterial).opacity =
          0.12 + pulse * 0.10 + hoverIntensity * 0.10;

        /* Helix */
        helixMat.uniforms.time.value  = t;
        helixMat2.uniforms.time.value = t;

        /* Lights */
        purpleKey.intensity  = 16 + pulse * 5 + clickPulse * 10;
        cyanFill.intensity   = 8  + (1 - pulse) * 4;
        pinkRim.intensity    = 5  + pulse * 3;
        amberAccent.intensity = 4 + pulse * 2;
        logoSpot.intensity   = 10 + hoverIntensity * 7 + clickPulse * 14;

        /* Particles */
        particles.rotation.y = t * 0.020;
        particles.rotation.x = Math.sin(t * 0.15) * 0.04;

        /* Shards */
        shardGroup.rotation.y = -t * 0.065;
        shardGroup.children.forEach((c, i) => {
          c.rotation.z += 0.003 + i * 0.00008;
          c.rotation.x += 0.002 + i * 0.00005;
        });

        /* Rings */
        ringGroup.rotation.z = t * 0.10;
        ringGroup.children.forEach((r, i) => {
          const m = (r as THREE.Mesh).material as THREE.MeshBasicMaterial;
          m.opacity = (0.38 - i * 0.06) * (0.55 + pulse * 0.45 + clickPulse * 0.3);
        });

        /* Grid */
        gridMat.uniforms.time.value = t;

        /* Logo */
        logoGroup.rotation.y = Math.sin(t * 0.36) * 0.58 + pointer.x * 0.30;
        logoGroup.rotation.x = Math.cos(t * 0.25) * 0.10 + pointer.y * 0.16;
        logoGroup.rotation.z = Math.PI / 4 + Math.sin(t * 0.18) * 0.05;
        logoGroup.position.y = Math.sin(t * 0.60) * 0.22;

        logoMat.emissiveIntensity =
          0.40 + pulse * 0.38 + hoverIntensity * 0.55 + clickPulse * 1.4;
        glow1.material.opacity = 0.40 + pulse * 0.28 + hoverIntensity * 0.22;
        glow2.material.opacity = 0.20 + (1 - pulse) * 0.18;
        glow3.material.opacity = 0.10 + pulse * 0.12;

        /* Bloom */
        if (bloomPass) {
          bloomPass.strength = 0.85 + clickPulse * 1.4 + hoverIntensity * 0.30;
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
          if (
            obj instanceof THREE.Mesh ||
            obj instanceof THREE.Points ||
            obj instanceof THREE.LineSegments
          ) {
            obj.geometry.dispose();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach(x => x.dispose()); else m.dispose();
          }
        });
        helixGeo.dispose();
        helix2Geo.dispose();
        gridMat.dispose();
        helixMat.dispose();
        helixMat2.dispose();
        orbMat.dispose();
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
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(110,84,255,0.10), transparent 70%)" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={mountRef}
      className={`scene-canvas pointer-events-auto absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
}
