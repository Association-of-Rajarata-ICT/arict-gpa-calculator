"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, reducedMotion, ScrollTrigger } from "@/lib/motion";

// The hero's horizon: a planet rising behind the department picker, its rim lit in ARICT red,
// with a slowly turning dot globe on its surface and a few embers drifting above it.
// Uses an orthographic camera measured in CSS pixels, so the horizon can be pinned to a DOM element.

const THEMES = {
  dark: {
    body: new THREE.Color("#0c0607"),
    rim: new THREE.Color("#ff4d4f"),
    glow: new THREE.Color("#e5484d"),
    glowStrength: 0.8,
    dots: new THREE.Color("#ffffff"),
    dotAlpha: 0.45,
    embers: new THREE.Color("#ff6b6e"),
  },
  light: {
    body: new THREE.Color("#ffffff"),
    rim: new THREE.Color("#c4161c"),
    glow: new THREE.Color("#e5484d"),
    glowStrength: 0.42,
    dots: new THREE.Color("#a00000"),
    dotAlpha: 0.28,
    embers: new THREE.Color("#c4161c"),
  },
};

const bodyShader = {
  vertex: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragment: /* glsl */ `
    uniform vec3 uBody;
    uniform vec3 uRim;
    varying vec3 vNormal;
    void main() {
      float fres = 1.0 - clamp(vNormal.z, 0.0, 1.0);
      // Light from above: the top edge of the planet burns brightest, like a sunrise.
      float top = smoothstep(-0.1, 0.95, vNormal.y);
      float rim = pow(fres, 7.0) * (0.15 + 1.0 * top);
      float sheen = pow(fres, 18.0) * top;
      vec3 col = mix(uBody, uRim, clamp(rim + sheen, 0.0, 1.0));
      gl_FragColor = vec4(col, 1.0);
    }`,
};

const glowShader = {
  vertex: bodyShader.vertex,
  fragment: /* glsl */ `
    uniform vec3 uGlow;
    uniform float uStrength;
    varying vec3 vNormal;
    void main() {
      // Back faces of a larger shell: 0 at its outer edge, rising toward the planet's limb.
      float k = clamp(-vNormal.z / 0.52, 0.0, 1.0);
      float halo = pow(k, 3.2);
      float top = 0.2 + 0.8 * smoothstep(-0.2, 0.9, vNormal.y);
      float a = halo * top * uStrength * 0.85;
      gl_FragColor = vec4(uGlow, a);
    }`,
};

const dotsShader = {
  vertex: /* glsl */ `
    uniform float uSize;
    varying float vFade;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normalize(position));
      // Dots fade toward the limb and away from the lit top edge.
      vFade = smoothstep(0.05, 0.6, n.z) * smoothstep(-0.2, 0.55, n.y);
      gl_PointSize = uSize;
      gl_Position = projectionMatrix * mv;
    }`,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    uniform float uAlpha;
    varying float vFade;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      gl_FragColor = vec4(uColor, uAlpha * vFade * smoothstep(0.5, 0.2, d));
    }`,
};

const embersShader = {
  vertex: /* glsl */ `
    attribute float aSeed;
    uniform float uTime;
    uniform float uHeight;
    uniform float uSize;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      float t = fract(uTime * (0.025 + aSeed * 0.035) + aSeed);
      p.y += t * uHeight;
      p.x += sin(uTime * 0.6 + aSeed * 40.0) * 14.0;
      vAlpha = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.55, 1.0, t)) * (0.35 + 0.65 * fract(aSeed * 7.0));
      gl_PointSize = uSize * (0.6 + fract(aSeed * 13.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      gl_FragColor = vec4(uColor, vAlpha * smoothstep(0.5, 0.0, d));
    }`,
};

function fibonacciSphere(count, radius) {
  const pts = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts[i * 3] = Math.cos(th) * r * radius;
    pts[i * 3 + 1] = y * radius;
    pts[i * 3 + 2] = Math.sin(th) * r * radius;
  }
  return pts;
}

export default function HeroScene({ anchorId }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const section = host?.parentElement;
    if (!host || !section) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the CSS glow behind the canvas stays as the fallback.
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
    camera.position.z = 2000;

    const planet = new THREE.Group();
    scene.add(planet);

    const isDark = () => document.documentElement.classList.contains("dark");
    const theme = () => THEMES[isDark() ? "dark" : "light"];

    const bodyMat = new THREE.ShaderMaterial({
      uniforms: { uBody: { value: theme().body.clone() }, uRim: { value: theme().rim.clone() } },
      vertexShader: bodyShader.vertex,
      fragmentShader: bodyShader.fragment,
    });
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uGlow: { value: theme().glow.clone() }, uStrength: { value: theme().glowStrength } },
      vertexShader: glowShader.vertex,
      fragmentShader: glowShader.fragment,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const dotsMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: theme().dots.clone() }, uAlpha: { value: theme().dotAlpha }, uSize: { value: 2.2 * dpr } },
      vertexShader: dotsShader.vertex,
      fragmentShader: dotsShader.fragment,
      transparent: true,
      depthWrite: false,
    });
    const embersMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: theme().embers.clone() }, uTime: { value: 0 }, uHeight: { value: 300 }, uSize: { value: 3 * dpr } },
      vertexShader: embersShader.vertex,
      fragmentShader: embersShader.fragment,
      transparent: true,
      depthWrite: false,
    });

    const sphereGeo = new THREE.SphereGeometry(1, 128, 96);
    const body = new THREE.Mesh(sphereGeo, bodyMat);
    const glow = new THREE.Mesh(sphereGeo, glowMat);
    planet.add(glow, body);

    const globe = new THREE.Group();
    planet.add(globe);
    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute("position", new THREE.BufferAttribute(fibonacciSphere(5200, 1.003), 3));
    const dots = new THREE.Points(dotsGeo, dotsMat);
    globe.add(dots);

    const EMBERS = 90;
    const emberPos = new Float32Array(EMBERS * 3);
    const emberSeed = new Float32Array(EMBERS);
    for (let i = 0; i < EMBERS; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 2;
      emberSeed[i] = Math.random();
    }
    const embersGeo = new THREE.BufferGeometry();
    embersGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
    embersGeo.setAttribute("aSeed", new THREE.BufferAttribute(emberSeed, 1));
    const embers = new THREE.Points(embersGeo, embersMat);
    scene.add(embers);
    const emberBase = emberPos.slice();

    // Fit the planet to the hero: its top edge sits just above the anchor (the picker panel).
    let baseY = 0;
    function layout() {
      const w = section.clientWidth;
      const h = section.clientHeight;
      renderer.setSize(w, h, false);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();

      const anchor = document.getElementById(anchorId);
      const sRect = section.getBoundingClientRect();
      const horizonFromTop = anchor ? anchor.getBoundingClientRect().top - sRect.top - (w < 640 ? 46 : 84) : h * 0.45;
      const radius = Math.max(w * 0.62, 520);
      const topY = h / 2 - horizonFromTop;
      baseY = topY - radius;
      planet.position.set(0, baseY, 0);
      planet.scale.setScalar(radius);
      glow.scale.setScalar(1.12);

      const posAttr = embersGeo.attributes.position;
      for (let i = 0; i < EMBERS; i++) {
        posAttr.array[i * 3] = emberBase[i * 3] * w * 0.42;
        posAttr.array[i * 3 + 1] = topY - 40;
      }
      posAttr.needsUpdate = true;
      embersMat.uniforms.uHeight.value = Math.min(360, horizonFromTop * 0.8);
    }
    layout();

    // Theme switches recolour the scene rather than rebuilding it.
    function applyTheme(animate) {
      const t = theme();
      const dur = animate ? 0.6 : 0;
      gsap.to(bodyMat.uniforms.uBody.value, { r: t.body.r, g: t.body.g, b: t.body.b, duration: dur });
      gsap.to(bodyMat.uniforms.uRim.value, { r: t.rim.r, g: t.rim.g, b: t.rim.b, duration: dur });
      gsap.to(glowMat.uniforms.uGlow.value, { r: t.glow.r, g: t.glow.g, b: t.glow.b, duration: dur });
      gsap.to(glowMat.uniforms.uStrength, { value: t.glowStrength, duration: dur });
      gsap.to(dotsMat.uniforms.uColor.value, { r: t.dots.r, g: t.dots.g, b: t.dots.b, duration: dur });
      gsap.to(dotsMat.uniforms.uAlpha, { value: t.dotAlpha, duration: dur });
      gsap.to(embersMat.uniforms.uColor.value, { r: t.embers.r, g: t.embers.g, b: t.embers.b, duration: dur });
    }
    const themeObserver = new MutationObserver(() => applyTheme(true));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Pointer tilts the globe a little; scrolling past the hero turns it and lifts the horizon.
    const tilt = { x: 0, y: 0 };
    const tiltX = gsap.quickTo(tilt, "x", { duration: 1.4, ease: "power3.out" });
    const tiltY = gsap.quickTo(tilt, "y", { duration: 1.4, ease: "power3.out" });
    const onPointer = (e) => {
      tiltX((e.clientX / window.innerWidth - 0.5) * 0.25);
      tiltY((e.clientY / window.innerHeight - 0.5) * 0.12);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const scroll = { p: 0 };
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => gsap.to(scroll, { p: self.progress, duration: 0.6, ease: "power2.out", overwrite: true }),
    });

    // Rise in on load.
    const rise = { y: 140, o: 0 };
    renderer.domElement.style.opacity = "0";
    gsap.to(rise, {
      y: 0,
      o: 1,
      duration: 2.2,
      ease: "expo.out",
      delay: 0.35,
      onUpdate: () => (renderer.domElement.style.opacity = String(rise.o)),
    });

    const still = reducedMotion();
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(section);

    const clock = new THREE.Clock();
    function frame() {
      const t = clock.getElapsedTime();
      globe.rotation.y = t * 0.035 + tilt.x + scroll.p * 0.9;
      globe.rotation.x = 0.32 + tilt.y;
      planet.position.x = tilt.x * -60;
      planet.position.y = baseY - rise.y + scroll.p * 120;
      embers.position.y = -rise.y + scroll.p * 80;
      embersMat.uniforms.uTime.value = t;
      renderer.render(scene, camera);
    }

    function loop() {
      if (visible) frame();
    }

    const onResize = () => {
      layout();
      if (still) frame();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(section);

    if (still) {
      rise.y = 0;
      rise.o = 1;
      renderer.domElement.style.opacity = "1";
      frame();
    } else {
      gsap.ticker.add(loop);
    }
    applyTheme(false);

    return () => {
      gsap.ticker.remove(loop);
      st.kill();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      sphereGeo.dispose();
      dotsGeo.dispose();
      embersGeo.dispose();
      [bodyMat, glowMat, dotsMat, embersMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [anchorId]);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0 -z-10" aria-hidden />;
}
