'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Suspense, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import heroWoodLogo from '@/pinto-pintos-transicoes-codex/assets/wood-logo-reference.png';

function Scene({ progress, mode }: { progress: MutableRefObject<number>; mode: 'studio' | 'home' }) {
  const mark = useRef<THREE.Group>(null);
  const source = useTexture(heroWoodLogo.src);
  const { viewport } = useThree();
  const portrait = viewport.aspect < 1;
  const baseX = portrait ? (mode === 'home' ? 0.08 : 0) : (mode === 'home' ? 0.45 : 1.1);
  const baseY = portrait ? (mode === 'home' ? -0.28 : -0.55) : 0;
  const baseScale = portrait ? (mode === 'home' ? 0.72 : 0.6) : (mode === 'home' ? 1.08 : 1);
  source.colorSpace = THREE.SRGBColorSpace;
  source.anisotropy = 8;

  useFrame(() => {
    if (!mark.current) return;
    const descend = THREE.MathUtils.smoothstep(progress.current, 0.04, 0.48);
    const moveLeft = THREE.MathUtils.smoothstep(progress.current, 0.52, 1);
    const finalX = portrait ? -0.62 : -1.3;
    const descendedY = portrait ? -1.05 : -0.78;
    const finalY = portrait ? 1.48 : 0.04;
    const finalScale = portrait ? 0.28 : 0.92;
    const targetX = THREE.MathUtils.lerp(baseX, finalX, moveLeft);
    const targetY = THREE.MathUtils.lerp(baseY, descendedY, descend) + (finalY - descendedY) * moveLeft;
    const descendedScale = baseScale * 0.9;
    const targetScale = THREE.MathUtils.lerp(baseScale, descendedScale, descend) + (finalScale - descendedScale) * moveLeft;

    mark.current.position.x = THREE.MathUtils.lerp(mark.current.position.x, targetX, 0.085);
    mark.current.position.y = THREE.MathUtils.lerp(mark.current.position.y, targetY, 0.085);
    const scale = THREE.MathUtils.lerp(mark.current.scale.x, targetScale, 0.085);
    mark.current.scale.setScalar(scale);
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[-3, 5, 7]} intensity={2.7} color="#fff4df" />
      <directionalLight position={[5, -1, 3]} intensity={0.65} color="#c99a64" />
      <group ref={mark} position={[baseX, baseY, 0]} scale={baseScale}>
        <mesh>
          <planeGeometry args={[4.65, 3.1]} />
          <meshStandardMaterial map={source} transparent alphaTest={0.02} roughness={0.74} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}

export default function StudioPanels({ progress, mode = 'studio' }: { progress: MutableRefObject<number>; mode?: 'studio' | 'home' }) {
  return (
    <Canvas dpr={[1, 1.7]} camera={{ position: [0, 0, 6.7], fov: 34 }} gl={{ alpha: true, antialias: true }}>
      <Suspense fallback={null}><Scene progress={progress} mode={mode} /></Suspense>
    </Canvas>
  );
}
