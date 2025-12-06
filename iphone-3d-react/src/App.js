import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import IPhoneModel from './IPhoneModel';
import './App.css';

function App() {
  const modelRef = useRef();

  const handleMouseMove = (event) => {
    const { clientX, clientY, currentTarget } = event;
    const { clientWidth, clientHeight } = currentTarget;

    // Normalize mouse position to -1 to 1
    const x = (clientX / clientWidth) * 2 - 1;
    const y = -(clientY / clientHeight) * 2 + 1;

    // Update model's mouse state
    if (modelRef.current && modelRef.current.setMouse) {
      modelRef.current.setMouse({ x, y });
    }
  };

  // Listen for mouse position from parent window (for tracking over hero text/buttons)
  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'mouseMove') {
        if (modelRef.current && modelRef.current.setMouse) {
          modelRef.current.setMouse({ x: event.data.x, y: event.data.y });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div
      className="App"
      style={{
        width: '100%',
        height: '700px',
        background: 'transparent',
        pointerEvents: 'auto' // Enable pointer events for OrbitControls
      }}
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          {/* Lighting - Bright Studio Setup */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2.5} />
          <directionalLight position={[-5, 5, 5]} intensity={1.5} />
          <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} />
          <pointLight position={[-10, -10, -10]} intensity={1} />

          {/* Controls - Enable drag to rotate */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            minPolarAngle={Math.PI / 2 - 0.5} // Limit vertical rotation
            maxPolarAngle={Math.PI / 2 + 0.5}
          />

          <IPhoneModel ref={modelRef} />
          {/* Environment removed to prevent 429 errors from external HDR loading */}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
