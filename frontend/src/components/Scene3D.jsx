import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import BuildingMesh from './BuildingMesh';

const Scene3D = ({ 
  buildings, 
  highlightedBuildings, 
  onBuildingClick, 
  selectedBuilding 
}) => {
  const groupRef = useRef();

  // Convert lat/lng to 3D coordinates
  const buildingsWithPositions = useMemo(() => {
    if (!buildings.length) return [];

    // Find center point
    const centerLat = buildings.reduce((sum, b) => sum + parseFloat(b.latitude), 0) / buildings.length;
    const centerLng = buildings.reduce((sum, b) => sum + parseFloat(b.longitude), 0) / buildings.length;

    return buildings.map((building, index) => {
      // Convert lat/lng to local coordinates (simplified projection)
      const x = (parseFloat(building.longitude) - centerLng) * 100000; // Scale factor
      const z = (parseFloat(building.latitude) - centerLat) * 100000;
      const height = building.height ? parseFloat(building.height) / 10 : 2; // Scale height

      return {
        ...building,
        position: [x, height / 2, z],
        height: height,
        isHighlighted: highlightedBuildings.some(hb => hb.id === building.id),
        isSelected: selectedBuilding?.id === building.id
      };
    });
  }, [buildings, highlightedBuildings, selectedBuilding]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [50, 50, 50], fov: 75 }}
        style={{ background: '#87CEEB' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <group ref={groupRef}>
          {buildingsWithPositions.map((building, index) => (
            <BuildingMesh
              key={building.id || index}
              building={building}
              onClick={() => onBuildingClick(building)}
            />
          ))}
        </group>

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshLambertMaterial color="#90EE90" />
        </mesh>

        {/* Title */}
        <Text
          position={[0, 30, -50]}
          fontSize={3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Calgary Urban Dashboard
        </Text>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Scene3D;