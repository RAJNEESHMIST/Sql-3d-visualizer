import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface EnergyBeamProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  active?: boolean;
  pulseSpeed?: number;
}

export function EnergyBeam({
  start,
  end,
  color = '#00f0ff',
  active = false,
  pulseSpeed = 2
}: EnergyBeamProps) {
  const lineRef = useRef<any>(null);
  const particlesRef = useRef<THREE.Group>(null);

  // Generate random phase offsets for particles
  const particleOffsets = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => i / 8);
  }, []);

  useFrame((state) => {
    if (!active) return;

    // Pulse line opacity
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      const t = state.clock.getElapsedTime();
      material.opacity = 0.4 + Math.sin(t * pulseSpeed * 2) * 0.3;
    }

    // Animate particles moving along path from start to end
    if (particlesRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const pGroup = particlesRef.current;
      
      pGroup.children.forEach((child, idx) => {
        const offset = particleOffsets[idx];
        const progress = (elapsed * pulseSpeed * 0.2 + offset) % 1.0;
        
        // Lerp position
        child.position.x = start[0] + (end[0] - start[0]) * progress;
        child.position.y = start[1] + (end[1] - start[1]) * progress;
        child.position.z = start[2] + (end[2] - start[2]) * progress;
      });
    }
  });

  if (!active) return null;

  // Create geometry vertices
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  const mainMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.7
  });

  const glowMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.2
  });

  const mainLine = new THREE.Line(lineGeometry, mainMaterial);
  const glowLine = new THREE.Line(lineGeometry, glowMaterial);

  return (
    <group>
      {/* Laser line connector */}
      <primitive ref={lineRef} object={mainLine} />

      {/* Beam Glow Cylindrical mesh overlay */}
      <mesh
        position={[
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2
        ]}
      >
        <primitive object={glowLine} />
      </mesh>

      {/* Flowing particles */}
      <group ref={particlesRef}>
        {particleOffsets.map((_, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

interface AccumulatorNodeProps {
  position: [number, number, number];
  active: boolean;
  value: number | string | null;
  label: string;
  accumulatingRowPos?: [number, number, number];
}

export function AccumulatorNode({
  position,
  active,
  value,
  label,
  accumulatingRowPos
}: AccumulatorNodeProps) {
  const nodeRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (nodeRef.current) {
      // Rotate node and pulse scale
      const t = state.clock.getElapsedTime();
      nodeRef.current.rotation.y = t * 0.5;
      nodeRef.current.rotation.x = t * 0.3;
      
      const pulse = 1 + Math.sin(t * 5) * 0.05;
      nodeRef.current.scale.set(pulse, pulse, pulse);
    }

    // Fly particles from row card to accumulator
    if (active && accumulatingRowPos && particlesRef.current) {
      const elapsed = state.clock.getElapsedTime();
      particlesRef.current.children.forEach((p, idx) => {
        const pOffset = idx * 0.25;
        const progress = (elapsed * 1.5 + pOffset) % 1.0;
        
        p.position.x = accumulatingRowPos[0] + (position[0] - accumulatingRowPos[0]) * progress;
        p.position.y = accumulatingRowPos[1] + (position[1] - accumulatingRowPos[1]) * progress;
        p.position.z = accumulatingRowPos[2] + (position[2] - accumulatingRowPos[2]) * progress;
      });
    }
  });

  if (!active) return null;

  return (
    <group position={position}>
      {/* Inner Glowing Core */}
      <mesh ref={nodeRef}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshPhysicalMaterial
          color="#39ff14"
          emissive="#39ff14"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.1}
          transmission={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Outer Wireframe Cage */}
      <mesh>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#39ff14" wireframe transparent opacity={0.2} />
      </mesh>

      {/* Floating Accumulator Labels */}
      <group position={[0, 1.0, 0]}>
        <Text
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {value !== null ? String(value) : '0'}
        </Text>
        <Text
          fontSize={0.13}
          color="#39ff14"
          position={[0, -0.25, 0]}
          anchorX="center"
          anchorY="middle"
        >
          {label.toUpperCase()}
        </Text>
      </group>

      {/* Incoming data particles */}
      {accumulatingRowPos && (
        <group ref={particlesRef}>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshBasicMaterial color="#39ff14" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
