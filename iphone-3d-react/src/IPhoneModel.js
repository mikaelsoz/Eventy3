import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const IPhoneModel = forwardRef((props, ref) => {
    const { scene } = useGLTF('./models/scene.gltf');
    const group = useRef();
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    // Expose setMouse to parent
    useImperativeHandle(ref, () => ({
        setMouse: (newMouse) => setMouse(newMouse)
    }));

    // Mouse tracking with smooth interpolation
    useFrame((state, delta) => {
        if (group.current) {
            // Subtle mouse interaction with MUCH lower sensitivity and clamped angles
            const targetRotationY = mouse.x * 0.15; // Reduced from 0.5 to 0.15 (70% less)
            const targetRotationX = mouse.y * 0.1;  // Reduced from 0.35 to 0.1 (71% less)

            // Clamp rotation to prevent phone from turning too far sideways
            const clampedRotationY = Math.max(-0.3, Math.min(0.3, targetRotationY)); // Max ±17 degrees
            const clampedRotationX = Math.max(-0.2, Math.min(0.2, targetRotationX)); // Max ±11 degrees

            // Smooth interpolation
            group.current.rotation.y = THREE.MathUtils.lerp(
                group.current.rotation.y,
                clampedRotationY,
                0.08
            );
            group.current.rotation.x = THREE.MathUtils.lerp(
                group.current.rotation.x,
                clampedRotationX,
                0.08
            );

            // Gentle auto-rotation for life
            group.current.rotation.y += delta * 0.05;

            // Subtle floating effect
            group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={group} {...props} dispose={null}>
            <primitive
                object={scene}
                scale={3.2}
                position={[0, -0.3, 0]}
                rotation={[0, Math.PI, 0]}
            />
        </group>
    );
});

useGLTF.preload('./models/scene.gltf');

export default IPhoneModel;
