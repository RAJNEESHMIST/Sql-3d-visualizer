import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { TableData } from '../../lib/datasets/sample-datasets';
import { ExecutionStep } from '../../lib/simulator';

interface TableNodeProps {
  position: [number, number, number];
  tableData: TableData;
  tableName: string;
  alias: string | null;
  currentStep: ExecutionStep | null;
  isSecondary?: boolean;
}

export function TableNode({
  position,
  tableData,
  tableName,
  alias,
  currentStep,
  isSecondary = false
}: TableNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rowsGroupRef = useRef<THREE.Group>(null);
  const scrollYRef = useRef<number>(0);

  const columns = tableData.columns;
  const rows = tableData.rows;

  // Determine active row index based on the current execution step
  const activeIdx = useMemo(() => {
    if (!currentStep) return -1;
    const targetId = isSecondary ? currentStep.secondaryRowId : currentStep.rowId;
    if (targetId === undefined) return -1;
    return rows.findIndex((r, i) => {
      const id = r.id || r.product_id || r.movie_id || i + 1;
      return id === targetId;
    });
  }, [currentStep, rows, isSecondary]);

  // Card layout dimensions
  const cardWidth = 3.5;
  const cardHeight = 0.45;
  const cardSpacing = 0.55;
  // Fixed viewport table height for glass container
  const viewportHeight = 4.0; 

  // Sliding window to prevent rendering too many items in 3D (max 7 rows rendered)
  const visibleRowsWithIndices = useMemo(() => {
    const windowSize = 7;
    const startIdx = activeIdx >= 0 ? Math.max(0, activeIdx - 3) : 0;
    const endIdx = Math.min(rows.length, startIdx + windowSize);
    
    // Adjust start index if we are near the end of the rows list
    const adjustedStartIdx = Math.max(0, Math.min(startIdx, rows.length - windowSize));
    return rows
      .map((r, i) => ({ row: r, originalIndex: i }))
      .slice(adjustedStartIdx, adjustedStartIdx + windowSize);
  }, [rows, activeIdx]);

  useFrame((state) => {
    // Subtle floating idle animation for the entire table panel
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(t + (isSecondary ? Math.PI : 0)) * 0.15;
    }

    // Smooth scroll interpolation (centering the active index)
    // The active index should scroll to the center (y=0) of the viewport.
    const targetScrollY = activeIdx >= 0 ? activeIdx * cardSpacing : 0;
    scrollYRef.current = THREE.MathUtils.lerp(scrollYRef.current, targetScrollY, 0.1);

    if (rowsGroupRef.current) {
      rowsGroupRef.current.position.y = scrollYRef.current;
    }
  });

  const getRowStatus = (row: Record<string, any>, idx: number) => {
    if (!currentStep) return 'idle';

    const rowId = row.id || row.product_id || row.movie_id || idx + 1;
    const stepType = currentStep.type;
    const stepRowId = currentStep.rowId;
    const stepSecRowId = currentStep.secondaryRowId;

    if (stepType === 'SCAN_ROW' && !isSecondary && stepRowId === rowId) {
      return 'scanning';
    }
    if (stepType === 'JOIN_SCAN' && isSecondary && stepSecRowId === rowId) {
      return 'scanning';
    }
    if (stepType === 'JOIN_MATCH') {
      if (!isSecondary && stepRowId === rowId) return 'passed';
      if (isSecondary && stepSecRowId === rowId) return 'passed';
    }
    if (stepType === 'JOIN_MISMATCH') {
      if (!isSecondary && stepRowId === rowId) return 'failed';
      if (isSecondary && stepSecRowId === rowId) return 'failed';
    }
    if (stepRowId === rowId && !isSecondary) {
      if (stepType === 'FILTER_EVAL') return 'evaluating';
      if (stepType === 'FILTER_PASS') return 'passed';
      if (stepType === 'FILTER_FAIL') return 'failed';
    }

    return 'idle';
  };

  const getGlowColor = (status: string) => {
    switch (status) {
      case 'scanning': return '#00f0ff';
      case 'evaluating': return '#bd00ff';
      case 'passed': return '#39ff14';
      case 'failed': return '#ff0055';
      default: return '#ffffff';
    }
  };

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Table Main Panel Backplate */}
      <mesh>
        <planeGeometry args={[cardWidth + 0.4, viewportHeight]} />
        <meshPhysicalMaterial
          color="#050510"
          transparent
          opacity={0.65}
          roughness={0.15}
          metalness={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.4}
          ior={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Table Border (Glowing Wireframe) */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(cardWidth + 0.4, viewportHeight)]} />
        <lineBasicMaterial color={isSecondary ? '#bd00ff' : '#00f0ff'} linewidth={1} />
      </lineSegments>

      {/* Table Header Section (Fixed at top of panel) */}
      <group position={[0, viewportHeight / 2 - 0.4, 0.03]}>
        <Text
          fontSize={0.24}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {tableName.toUpperCase()} {alias ? `(${alias})` : ''}
        </Text>
        <mesh position={[0, -0.2, 0]}>
          <planeGeometry args={[cardWidth, 0.02]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Column Headers listed vertically (Fixed below Title) */}
      <group position={[0, viewportHeight / 2 - 0.9, 0.03]}>
        <Text
          fontSize={0.11}
          color="#a0aec0"
          anchorX="center"
        >
          Columns: {columns.map(c => c.name).join(' | ')}
        </Text>
      </group>

      {/* Scrolling Rows Area (Masked inside viewport height) */}
      <group position={[0, 0, 0.01]}>
        <group ref={rowsGroupRef}>
          {visibleRowsWithIndices.map(({ row, originalIndex }) => {
            const status = getRowStatus(row, originalIndex);
            const glowColor = getGlowColor(status);
            const isHighlighted = status !== 'idle';
            
            const rowText = Object.keys(row)
              .filter(k => k !== 'id' && !k.includes('.'))
              .map(k => `${k}:${row[k]}`)
              .join('  ');

            const rowIdVal = row.id || row.product_id || row.movie_id || originalIndex + 1;
            const labelText = `#${rowIdVal}: ${rowText.slice(0, 36)}${rowText.length > 36 ? '..' : ''}`;

            // Calculate local Y coordinate relative to the scroll container.
            // Shifting by index.
            const cardY = -originalIndex * cardSpacing;

            // Hide cards that have scrolled outside the viewport height to prevent overlap.
            const currentScrollY = scrollYRef.current;
            const worldCardY = cardY + currentScrollY;
            const isOutsideViewport = Math.abs(worldCardY) > (viewportHeight / 2 - 0.7);

            if (isOutsideViewport) return null;

            return (
              <group key={originalIndex} position={[0, cardY, 0]}>
                {/* Row Backplane Card */}
                <mesh>
                  <planeGeometry args={[cardWidth, cardHeight]} />
                  <meshPhysicalMaterial
                    color={isHighlighted ? glowColor : '#ffffff'}
                    transparent
                    opacity={isHighlighted ? 0.25 : 0.04}
                    roughness={0.1}
                    metalness={0.5}
                    transmission={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Row Glowing Edges when active */}
                {isHighlighted && (
                  <lineSegments>
                    <edgesGeometry args={[new THREE.PlaneGeometry(cardWidth, cardHeight)]} />
                    <lineBasicMaterial color={glowColor} linewidth={2} />
                  </lineSegments>
                )}

                {/* Row Text */}
                <Text
                  position={[-cardWidth / 2 + 0.15, 0, 0.01]}
                  fontSize={0.13}
                  color={isHighlighted ? '#ffffff' : '#e2e8f0'}
                  anchorX="left"
                  anchorY="middle"
                >
                  {labelText}
                </Text>
              </group>
            );
          })}
        </group>
      </group>

      {/* Virtual Scroll Counter/HUD */}
      <group position={[0, -viewportHeight / 2 + 0.35, 0.03]}>
        <Text fontSize={0.1} color="#4a5568">
          Total rows: {rows.length} | Scanned index: {activeIdx >= 0 ? activeIdx + 1 : 'none'}
        </Text>
      </group>
    </group>
  );
}
