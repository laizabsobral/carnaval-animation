import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function ConfettiRain(scene) {
  const confettiCount = 2000;
  const confettiSize = 0.1;
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  const confettiSpeed = 0.05;

  const confettiMeshes = [];

  for (let i = 0; i < confettiCount; i++) {
    const geometry = new THREE.BoxGeometry(confettiSize, confettiSize, confettiSize);
    const material = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
    const confetti = new THREE.Mesh(geometry, material);

    confetti.position.x = Math.random() * 10 - 5;
    confetti.position.y = Math.random() * 10 + 5; // Começa acima do campo de visão
    confetti.position.z = Math.random() * 10 - 5;

    confetti.rotation.x = Math.random() * Math.PI;
    confetti.rotation.y = Math.random() * Math.PI;

    scene.add(confetti);
    confettiMeshes.push(confetti);
  }

  function animateConfetti() {
    confettiMeshes.forEach(confetti => {
      confetti.position.y -= confettiSpeed;
      if (confetti.position.y < -5) {
        // Reseta a posição se o confete cair abaixo do limite
        confetti.position.y = 10;
      }
    });
  }

  return {
    animateConfetti
  };
}

function ModelViewer() {
  const controls = useRef();
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x5E05A4);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load('./assets/umbrella.glb', function (gltf) {
      scene.add(gltf.scene);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    const { animateConfetti } = ConfettiRain(scene); // Adiciona a chuva de confete à cena

    const animate = () => {
      requestAnimationFrame(animate);
      animateConfetti(); // Atualiza a posição dos confetes
      renderer.render(scene, camera);
    };

    animate();

    controls.current = new OrbitControls(camera, renderer.domElement);
    controls.current.enableDamping = true;
    controls.current.dampingFactor = 0.25;
    controls.current.screenSpacePanning = false;
    controls.current.maxPolarAngle = Math.PI / 2;

    const resizeHandler = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
}

export default ModelViewer;
