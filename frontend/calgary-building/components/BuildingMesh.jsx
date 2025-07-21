// // components/BuildingMesh.jsx
// import React, { useRef, useState } from 'react';
// import { useFrame } from '@react-three/fiber';

// const BuildingMesh = ({ building, onClick }) => {
//   const meshRef = useRef();
//   const [hovered, setHovered] = useState(false);

//   useFrame((_, delta) => {
//     if (building.isSelected && meshRef.current) {
//       meshRef.current.rotation.y += delta * 0.5;
//     }
//   });

//   const getColor = () => {
//     if (building.isSelected)   return '#ff6b6b';  // spinning red
//     if (building.isHighlighted) return 'yellow';    // query match
//     if (hovered)                return '#95e1d3';  // hover effect
//     return 'grey';                                // default
//   };

//   return (
//     <mesh
//       ref={meshRef}
//       position={building.position}
//       onClick={onClick}
//       onPointerOver={() => setHovered(true)}
//       onPointerOut={() => setHovered(false)}
//     >
//       <boxGeometry args={[2, building.height, 2]} />
//       <meshLambertMaterial
//         color={getColor()}
//         transparent
//         opacity={building.isHighlighted || building.isSelected ? 0.9 : 0.8}
//       />
//       {building.isSelected && (
//         <meshBasicMaterial wireframe color="#000" />
//       )}
//     </mesh>
//   );
// };

// export default BuildingMesh;
// import React, { useRef, useState } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { RoundedBox, Edges } from '@react-three/drei';

// export default function BuildingMesh({ building, onClick }) {
//   const meshRef = useRef();
//   const [hovered, setHovered] = useState(false);

//   // Spin selected buildings
//   useFrame((_, delta) => {
//     if (building.isSelected && meshRef.current) {
//       meshRef.current.rotation.y += delta * 0.3;
//     }
//   });

//   // Base PBR material parameters
//   const baseMat = {
//     metalness: 0.3,
//     roughness: 0.6,
//     castShadow: true,
//     receiveShadow: true,
//   };

//   // Decide color
//   const getColor = () => {
//     if (building.isSelected)   return '#ff6b6b';
//     if (building.isHighlighted) return '#ffd54f';
//     if (hovered)                return '#b2ebf2';
//     // subtle tint by type
//     switch (building.building_type) {
//       case 'Commercial':  return '#eeeeee';
//       case 'Residential': return '#cfd8dc';
//       case 'Mixed Use':   return '#e0e0e0';
//       default:            return '#fafafa';
//     }
//   };

//   return (
//     <group position={building.position}>
//       <RoundedBox
//         ref={meshRef}
//         args={[2, building.height, 2]}
//         radius={0.1}
//         smoothness={4}
//         onClick={onClick}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={()  => setHovered(false)}
//         {...baseMat}
//       >
//         <meshStandardMaterial
//           color={getColor()}
//           {...baseMat}
//           transparent
//           opacity={building.isHighlighted || building.isSelected ? 0.95 : 0.85}
//         />
//       </RoundedBox>

//       {/* Subtle wireframe on hover/selection */}
//       <Edges
//         scale={1.01}
//         threshold={15}
//         color={hovered || building.isSelected ? '#40c4ff' : '#333'}
//       />
//     </group>
//   );
// }


// components/BuildingMesh.jsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Edges } from '@react-three/drei';

export default function BuildingMesh({ building, onClick }) {
  const { isSelected, isHighlighted, hasQuery, building_type, height, position } = building;
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Spin selected buildings
  useFrame((_, delta) => {
    if (isSelected && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  // Decide actual color
  const getColor = () => {
    // 1) Always override selected
    if (isSelected)   return '#ff6b6b';
    // 2) If we've done a query, show highlights vs grey
    if (hasQuery) {
      if (isHighlighted) return '#ffd54f';  // yellow highlights
      return 'grey';                        // everything else
    }
    // 3) No query yet → color by type (and hover)
    if (hovered) return '#b2ebf2';
    switch (building_type) {
      case 'Commercial':  return '#eeeeee';
      case 'Residential': return '#cfd8dc';
      case 'Mixed Use':   return '#e0e0e0';
      default:            return '#fafafa';
    }
  };

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[2, height, 2]}
        radius={0.1}
        smoothness={4}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={()  => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={getColor()}
          metalness={0.3}
          roughness={0.6}
          transparent
          opacity={isHighlighted || isSelected ? 0.95 : 0.85}
        />
      </RoundedBox>

      <Edges
        scale={1.01}
        threshold={15}
        color={hovered || isSelected ? '#40c4ff' : '#333'}
      />
    </group>
  );
}
