import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Mesh } from "three";

const MeshComponent = () => {
  const fileUrl = "/mesh_0.obj";
  const mesh = useRef(new Mesh());
  const obj = useLoader(OBJLoader, fileUrl);
  console.log(obj);
  console.log(mesh);

  useFrame(async () => {
    mesh.current.rotation.z += 0.01;
  });

  return (
    <mesh ref={mesh}>
      <primitive object={obj} />
    </mesh>
  );
}

const Renderer = () => {
  return (
    <div className='flex justify-center items-center h-screen'>
      <Canvas className='h-2xl w-2xl'>
        <OrbitControls />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <MeshComponent />
      </Canvas>
    </div>
  );
}

export default Renderer;