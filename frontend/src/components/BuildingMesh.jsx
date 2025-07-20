import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const BuildingMesh = ({ building, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (building.isSelected && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const getColor = () => {
    if (building.isSelected) return '#ff6b6b';
    if (building.isHighlighted) return '#4ecdc4';
    if (hovered) return '#95e1d3';
    
    // Color by building type
    switch (building.building_type) {
      case 'Commercial': return '#fce38a';
      case 'Residential': return '#a8e6cf';
      case 'Mixed Use': return '#dda0dd';
      default: return '#d4c5f9';
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={building.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[2, building.height, 2]} />
      <meshLambertMaterial 
        color={getColor()}
        transparent
        opacity={building.isHighlighted || building.isSelected ? 0.9 : 0.8}
      />
      
      {/* Wireframe for selected building */}
      {building.isSelected && (
        <meshBasicMaterial wireframe color="#000" />
      )}
    </mesh>
  );
};

export default BuildingMesh;