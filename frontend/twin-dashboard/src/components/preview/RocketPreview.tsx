import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  modelPath: string;
};

function Model({ modelPath }: Props) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // Create a unique clone for this component instance
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Center>
      <primitive 
        ref={meshRef} 
        object={clonedScene} 
        scale={1.2} 
      />
    </Center>
  );
}

// Fallback component (shown if the GLB fails to load or while loading)
function FallbackMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.3, 0.5, 2, 32]} />
      <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

export default function RocketPreview({modelPath}: Props) {
  return (
    <div style={{ width: 220, height: 140 }}>
      <Canvas
        camera={{ position: [0, 0, 60], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        
        <React.Suspense fallback={<FallbackMesh />}>
          <Model modelPath={modelPath} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}