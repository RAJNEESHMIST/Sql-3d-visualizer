import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSqlStore } from '../../store/useSqlStore';
import { TableNode } from './TableNode';
import { EnergyBeam, AccumulatorNode } from './EnergyBeam';

// Helper component to smoothly control camera presets
function CameraController({ preset }: { preset: 'front' | 'top' | 'isometric' }) {
  const { camera } = useThree();
  
  useEffect(() => {
    const targetPos = new THREE.Vector3();
    if (preset === 'front') {
      targetPos.set(0, -0.3, 7.5);
    } else if (preset === 'top') {
      targetPos.set(0, 8.5, 0.01);
    } else {
      // Isometric
      targetPos.set(6.0, 4.0, 6.0);
    }

    // Smooth transition
    let frameId: number;
    const animate = () => {
      camera.position.lerp(targetPos, 0.08);
      camera.lookAt(0, -0.3, 0);
      if (camera.position.distanceTo(targetPos) > 0.05) {
        frameId = requestAnimationFrame(animate);
      }
    };
    animate();
    
    return () => cancelAnimationFrame(frameId);
  }, [preset, camera]);

  return null;
}

// Sub-component to manage scene contents
function SceneContent({ cameraPreset }: { cameraPreset: 'front' | 'top' | 'isometric' }) {
  const selectedDatasetName = useSqlStore((state) => state.selectedDatasetName);
  const availableDatasets = useSqlStore((state) => state.availableDatasets);
  const simulationResult = useSqlStore((state) => state.simulationResult);
  const currentStepIndex = useSqlStore((state) => state.currentStepIndex);
  const parsedQuery = useSqlStore((state) => state.parsedQuery);

  const baseTable = availableDatasets[selectedDatasetName];
  
  // Find joined table details if any
  const joinedTableMeta = parsedQuery?.joins[0];
  const joinedTableName = joinedTableMeta?.table.toLowerCase();
  const joinedTable = joinedTableName ? availableDatasets[joinedTableName] : null;

  const currentStep = simulationResult && currentStepIndex >= 0
    ? simulationResult.steps[currentStepIndex]
    : null;

  // Float positions for tables (Compact centering)
  const baseTablePos: [number, number, number] = joinedTable ? [-3.2, 1.0, 0] : [0, 1.0, 0];
  const joinedTablePos: [number, number, number] = [3.2, 1.0, 0];
  const resultTablePos: [number, number, number] = [0, -1.8, 0.2];

  // Compute laser coordinates
  const laserBeamDetails = (() => {
    if (!currentStep || !baseTable) return null;
    
    const isJoinStep = ['JOIN_SCAN', 'JOIN_MATCH', 'JOIN_MISMATCH'].includes(currentStep.type);
    if (!isJoinStep || !joinedTable) return null;

    const leftIdx = baseTable.rows.findIndex(r => (r.id || r.product_id || r.movie_id) === currentStep.rowId);
    const rightIdx = joinedTable.rows.findIndex(r => (r.id || r.product_id || r.movie_id) === currentStep.secondaryRowId);

    if (leftIdx === -1 || rightIdx === -1) return null;

    // Laser centers at the scrolling scanning gate (Y=1.0)
    const startY = baseTablePos[1];
    const endY = joinedTablePos[1];

    const color = currentStep.type === 'JOIN_MATCH' ? '#39ff14' : currentStep.type === 'JOIN_MISMATCH' ? '#ff0055' : '#00f0ff';

    return {
      start: [baseTablePos[0] + 1.75, startY, 0.05] as [number, number, number],
      end: [joinedTablePos[0] - 1.75, endY, 0.05] as [number, number, number],
      color,
      active: true
    };
  })();

  // Aggregation node details
  const aggregatorDetails = (() => {
    if (!currentStep || !baseTable) return null;
    
    const isAggStep = ['AGGREGATE_ACCUMULATE', 'AGGREGATE_FINAL'].includes(currentStep.type);
    if (!isAggStep) return null;

    // Find coordinate of the row currently flying its data
    let rowWorldPos: [number, number, number] | undefined;
    if (currentStep.rowId !== undefined) {
      const idx = baseTable.rows.findIndex(r => (r.id || r.product_id || r.movie_id) === currentStep.rowId);
      if (idx !== -1) {
        rowWorldPos = [baseTablePos[0], baseTablePos[1], 0.05]; // point to scrolling center
      }
    }

    const valueName = currentStep.accumulated ? Object.keys(currentStep.accumulated)[0] : '';
    const valueVal = currentStep.accumulated ? currentStep.accumulated[valueName] : null;

    return {
      active: true,
      position: [0, 2.2, 1.2] as [number, number, number],
      label: valueName || 'ACCUMULATOR',
      value: valueVal,
      accumulatingRowPos: rowWorldPos
    };
  })();

  // Construct mock data for the result panel on the fly
  const resultTableData = (() => {
    if (!simulationResult) return null;
    return {
      name: 'results',
      description: 'Result rows projected from pipeline',
      columns: simulationResult.columns.map(c => ({ name: c, type: 'STRING' as const })),
      rows: simulationResult.rows
    };
  })();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} color="#bd00ff" intensity={1} />
      <pointLight position={[10, -10, 10]} color="#00f0ff" intensity={1} />

      {/* Preset Camera Controller */}
      <CameraController preset={cameraPreset} />

      {/* Futuristic Cyber Floor (Raised to match compact layout) */}
      <Grid
        position={[0, -3.5, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={1}
        cellColor="#1f2937"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#bd00ff"
        fadeDistance={20}
      />

      {/* Base Table Panel */}
      {baseTable && (
        <TableNode
          position={baseTablePos}
          tableData={baseTable}
          tableName={baseTable.name}
          alias={parsedQuery?.from[0]?.as || null}
          currentStep={currentStep}
        />
      )}

      {/* Optional Joined Table Panel */}
      {joinedTable && (
        <TableNode
          position={joinedTablePos}
          tableData={joinedTable}
          tableName={joinedTable.name}
          alias={joinedTableMeta?.as || null}
          currentStep={currentStep}
          isSecondary
        />
      )}

      {/* Join laser beams */}
      {laserBeamDetails && (
        <EnergyBeam
          start={laserBeamDetails.start}
          end={laserBeamDetails.end}
          color={laserBeamDetails.color}
          active={laserBeamDetails.active}
        />
      )}

      {/* Aggregator Accumulation Sphere */}
      {aggregatorDetails && (
        <AccumulatorNode
          position={aggregatorDetails.position}
          active={aggregatorDetails.active}
          value={aggregatorDetails.value}
          label={aggregatorDetails.label}
          accumulatingRowPos={aggregatorDetails.accumulatingRowPos}
        />
      )}

      {/* Final Results Table Panel (Materializes after projection or output stages) */}
      {resultTableData && currentStep && ['RETURN_RESULT', 'PROJECT_COLUMN'].includes(currentStep.type) && (
        <group>
          <TableNode
            position={resultTablePos}
            tableData={resultTableData}
            tableName="query_results"
            alias={null}
            currentStep={currentStep}
          />
          {/* Neon pointer pointing to results */}
          <Text
            fontSize={0.2}
            position={[0, -1.0, 0]}
            color="#39ff14"
          >
            OUTPUT MATERIALIZED
          </Text>
        </group>
      )}
    </>
  );
}

interface VisualizationCanvasProps {
  cameraPreset: 'front' | 'top' | 'isometric';
}

export function VisualizationCanvas({ cameraPreset }: VisualizationCanvasProps) {
  const controlsRef = useRef<any>(null);

  // Smoothly reset the look-at target of the OrbitControls whenever view presets are clicked
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, -0.3, 0);
      controlsRef.current.update();
    }
  }, [cameraPreset]);

  return (
    <div className="w-full h-full relative min-h-[450px]">
      <Canvas
        camera={{ position: [6.0, 4.0, 6.0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent cameraPreset={cameraPreset} />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1} // don't go below floor
          minDistance={3}
          maxDistance={25}
        />
      </Canvas>
      
      {/* Absolute positioning UI helpers */}
      <div className="absolute top-4 left-4 pointer-events-none glass-panel p-2 px-3 rounded-md border text-xs text-gray-400">
        <span className="text-cyan-400 font-bold">Left Click + Drag:</span> Orbit | <span className="text-cyan-400 font-bold">Scroll:</span> Zoom | <span className="text-cyan-400 font-bold">Right Click + Drag:</span> Pan
      </div>
    </div>
  );
}
