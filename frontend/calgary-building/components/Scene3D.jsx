// // components/Scene3D.jsx
// import React, { useRef, useMemo } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Text } from '@react-three/drei';
// import BuildingMesh from './BuildingMesh';

// const Scene3D = ({
//   buildings,
//   highlightedBuildings,
//   onBuildingClick,
//   selectedBuilding
// }) => {
//   const groupRef = useRef();

//   const { positioned } = useMemo(() => {
//     if (!buildings.length) return { positioned: [] };

//     const lats = buildings.map(b => parseFloat(b.latitude));
//     const lngs = buildings.map(b => parseFloat(b.longitude));
//     const minLat = Math.min(...lats), maxLat = Math.max(...lats);
//     const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

//     const planeSize = 200;
//     const spanLat = maxLat - minLat || 1;
//     const spanLng = maxLng - minLng || 1;
//     const scaleX = planeSize / spanLng;
//     const scaleZ = planeSize / spanLat;

//     const positioned = buildings.map(b => {
//       const lat = parseFloat(b.latitude);
//       const lng = parseFloat(b.longitude);
//       const rawH = b.height ? parseFloat(b.height) : 0;
//       const height = rawH > 0 ? rawH / 10 : 2;

//       const x = (lng - minLng) * scaleX - planeSize / 2;
//       const z = (lat - minLat) * scaleZ - planeSize / 2;

//       const isHighlighted = highlightedBuildings
//         .some(h => h.id === b.id);
//       const isSelected = selectedBuilding?.id === b.id;

//       return {
//         ...b,
//         position: [x, height / 2, z],
//         height,
//         isHighlighted,
//         isSelected
//       };
//     });

//     return { positioned };
//   }, [buildings, highlightedBuildings, selectedBuilding]);

//   return (
//     <div style={{ width: '100%', height: '100%' }}>
//       <Canvas camera={{ position: [50, 50, 50], fov: 75 }} style={{ background: '#87CEEB' }}>
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[10, 10, 5]} intensity={1} />

//         <group ref={groupRef}>
//           {positioned.map((building, i) => (
//             <BuildingMesh
//               key={building.id || i}
//               building={building}
//               onClick={() => onBuildingClick(building)}
//             />
//           ))}
//         </group>

//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
//           <planeGeometry args={[200, 200]} />
//           <meshLambertMaterial color="#90EE90" />
//         </mesh>

//         <Text position={[0, 30, -50]} fontSize={3} color="white" anchorX="center" anchorY="middle">
//           Calgary Urban Dashboard
//         </Text>

//         <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2} />
//       </Canvas>
//     </div>
//   );
// };

// export default Scene3D;

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

  const positioned = useMemo(() => {
    if (!buildings.length) return [];

    const lats = buildings.map(b => +b.latitude);
    const lngs = buildings.map(b => +b.longitude);
    const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
    const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
    const planeSize = 200;
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
        {/* Sky + HDR environment for realistic lighting */}
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

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#90EE90" roughness={1} />
        </mesh>

        {/* Soft contact shadows */}
        <ContactShadows
          position={[0, 0.01, 0]}
          width={200}
          height={200}
          opacity={0.5}
          blur={2}
          far={50}
        />

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

        {/* Camera controls */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
