"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import type { TrustState } from "./trust-chamber";

function Chamber({ state }: { state: TrustState }) {
  const mesh = useRef<Mesh>(null);
  const healthy = state.rlsHealthy && state.vaultIntegrity !== "attention";
  useFrame((_, delta) => { if (mesh.current) mesh.current.rotation.y += delta * (healthy ? 0.18 : 0.06); });
  const color = healthy ? "#a3e635" : "#fbbf24";
  return <group ref={mesh}><RoundedBox args={[2.5, 1.7, 1.8]} radius={0.18} smoothness={5}><meshStandardMaterial color="#10231f" metalness={0.65} roughness={0.24} /></RoundedBox><mesh position={[0, 0, 0.94]}><planeGeometry args={[1.55, 0.9]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} /></mesh><mesh position={[0, 0, 1.02]}><ringGeometry args={[0.3, 0.38, 32]} /><meshBasicMaterial color="#f7fbf8" /></mesh><pointLight position={[0, 0, 2]} intensity={healthy ? 3 : 1.5} color={color} distance={5} /></group>;
}

export default function TrustScene({ state, label }: { state: TrustState; label: string }) {
  return <div className="trust-scene" role="img" aria-label={`${label}: ${state.rlsHealthy ? "RLS healthy" : "RLS needs attention"}; ${state.pendingRotations} pending rotations; vault ${state.vaultIntegrity}`}><Canvas camera={{ position: [0, 0.2, 5], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "low-power" }}><ambientLight intensity={0.5} /><directionalLight position={[3, 4, 5]} intensity={2} /><Chamber state={state} /><Environment preset="city" /><OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.4} /></Canvas><p className="sr-only">{label}. RLS {state.rlsHealthy ? "healthy" : "requires attention"}. {state.pendingRotations} pending rotations. Vault state: {state.vaultIntegrity}.</p></div>;
}
