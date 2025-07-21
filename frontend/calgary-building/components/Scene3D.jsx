// components/Scene3D.jsx
import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Sky,
  Environment,
  ContactShadows,
  Text
} from '@react-three/drei';
import BuildingMesh from './BuildingMesh';

export default function Scene3D({
  buildings,
  highlightedBuildings,
  selectedBuilding,
  onBuildingClick
}) {
  const groupRef = useRef();
  const hasQuery = highlightedBuildings.length > 0;

  const planeSize = 200;
  const compassOffset = 5;

  const positioned = useMemo(() => {
    if (!buildings.length) return [];

    const lats = buildings.map(b => +b.latitude);
    const lngs = buildings.map(b => +b.longitude);
    const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
    const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
    const scaleX = planeSize / ((maxLng - minLng) || 1);
    const scaleZ = planeSize / ((maxLat - minLat) || 1);

    return buildings.map(b => {
      const lat = +b.latitude, lng = +b.longitude;
      const rawH = b.height ? +b.height : 0;
      const height = rawH > 0 ? rawH / 10 : 2;
      const x = (lng - minLng) * scaleX - planeSize / 2;
      const z = (lat - minLat) * scaleZ - planeSize / 2;
      const isHighlighted = highlightedBuildings.some(f => f.id === b.id);
      const isSelected    = selectedBuilding?.id === b.id;
      return { ...b, position: [x, height / 2, z], height, isHighlighted, isSelected, hasQuery };
    });
  }, [buildings, highlightedBuildings, selectedBuilding]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ position: [50, 50, 50], fov: 75 }}
        style={{ background: '#87CEEB' }}
      >
        {/* Sky & Environment */}
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />

        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[20, 50, 10]}
          intensity={1}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />

        {/* Buildings */}
        <group ref={groupRef}>
          {positioned.map((b, i) => (
            <BuildingMesh
              key={b.id || i}
              building={b}
              onClick={() => onBuildingClick(b)}
            />
          ))}
        </group>

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[planeSize, planeSize]} />
          <meshStandardMaterial color="#90EE90" roughness={1} />
        </mesh>

        {/* Contact Shadows */}
        <ContactShadows
          position={[0, 0.01, 0]}
          width={planeSize}
          height={planeSize}
          opacity={0.5}
          blur={2}
          far={50}
        />

        {/* Compass Labels */}
        <Text
          position={[0, 1, planeSize/2 + compassOffset]}
          fontSize={4}
          color="black"
          anchorX="center" anchorY="middle"
        >North</Text>

        <Text
          position={[0, 1, -planeSize/2 - compassOffset]}
          fontSize={4}
          color="black"
          anchorX="center" anchorY="middle"
        >South</Text>

        <Text
          position={[planeSize/2 + compassOffset, 1, 0]}
          rotation={[0, -Math.PI/2, 0]}
          fontSize={4}
          color="black"
          anchorX="center" anchorY="middle"
        >East</Text>

        <Text
          position={[-planeSize/2 - compassOffset, 1, 0]}
          rotation={[0, Math.PI/2, 0]}
          fontSize={4}
          color="black"
          anchorX="center" anchorY="middle"
        >West</Text>

        {/* Title */}
        <Text
          position={[0, 30, -50]}
          fontSize={10}
          color="white"
          anchorX="center" anchorY="middle"
        >
          Calgary Urban Dashboard
        </Text>

        {/* Controls */}
        <OrbitControls
          enablePan enableZoom enableRotate
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
