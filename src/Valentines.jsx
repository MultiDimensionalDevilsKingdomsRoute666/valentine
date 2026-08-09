import Valentine from './valentine';
import { Canvas } from '@react-three/fiber';
import './home.css';
import { create } from 'zustand';
import { useEffect, useRef, useState } from 'react';

const CAMERA_Z = 100;
const CAMERA_FOV = 50;

const useColorStore = create(set => ({
  red: 224,
  green: 33,
  blue: 138,
  setRed: event => set(_ => ({ red: event.target.value })),
  setGreen: event => set(_ => ({ green: event.target.value })),
  setBlue: event => set(_ => ({ blue: event.target.value })),
}));

export function ColorSettings({ settingsRef }) {
  const red = useColorStore(state => state.red);
  const green = useColorStore(state => state.green);
  const blue = useColorStore(state => state.blue);
  const setRed = useColorStore(state => state.setRed);
  const setGreen = useColorStore(state => state.setGreen);
  const setBlue = useColorStore(state => state.setBlue);

  return (
    <div id="settings" ref={settingsRef}>
      <div id="header">Color</div>
      <div id="sliders">
        <input
          id="red"
          value={red}
          onChange={setRed}
          key="red"
          type="range"
          min="0"
          max="255"
        />
        <input
          id="green"
          value={green}
          onChange={setGreen}
          key="green"
          type="range"
          min="0"
          max="255"
        />
        <input
          id="blue"
          value={blue}
          onChange={setBlue}
          key="blue"
          type="range"
          min="0"
          max="255"
        />
      </div>
    </div>
  );
}

export default function Valentines() {
  const red = useColorStore(state => state.red);
  const green = useColorStore(state => state.green);
  const blue = useColorStore(state => state.blue);

  const settingsRef = useRef(null);
  const [offset, setOffset] = useState([0, 0, 0]);

  useEffect(() => {
    const recalcOffset = () => {
      const panel = settingsRef.current;
      if (!panel) return;

      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      const { width: panelWidth, height: panelHeight } =
        panel.getBoundingClientRect();

      // Visible area is the container minus the top-left settings panel,
      // split into the strip to the right of it and the strip below it.
      const rightWidth = Math.max(containerWidth - panelWidth, 0);
      const rightArea = rightWidth * containerHeight;
      const rightCenterX = panelWidth + rightWidth / 2;
      const rightCenterY = containerHeight / 2;

      const belowHeight = Math.max(containerHeight - panelHeight, 0);
      const belowArea = panelWidth * belowHeight;
      const belowCenterX = panelWidth / 2;
      const belowCenterY = panelHeight + belowHeight / 2;

      const totalArea = rightArea + belowArea;
      const targetX =
        totalArea > 0
          ? (rightArea * rightCenterX + belowArea * belowCenterX) / totalArea
          : containerWidth / 2;
      const targetY =
        totalArea > 0
          ? (rightArea * rightCenterY + belowArea * belowCenterY) / totalArea
          : containerHeight / 2;

      const visibleHeight =
        2 * CAMERA_Z * Math.tan((CAMERA_FOV * Math.PI) / 360);
      const unitsPerPixel = visibleHeight / containerHeight;

      setOffset([
        (targetX - containerWidth / 2) * unitsPerPixel,
        -(targetY - containerHeight / 2) * unitsPerPixel,
        0,
      ]);
    };

    recalcOffset();

    const resizeObserver = new ResizeObserver(recalcOffset);
    resizeObserver.observe(settingsRef.current);
    window.addEventListener('resize', recalcOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', recalcOffset);
    };
  }, []);

  return (
    <div>
      <ColorSettings settingsRef={settingsRef} />
      <div id="home">
        <Canvas camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}>
          <color attach="background" args={['hotpink']} />
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <directionalLight position={[-10, -10, -10]} intensity={0.5} />
          <Valentine
            color={'rgb(' + red + ',' + green + ',' + blue + ')'}
            offset={offset}
          />
        </Canvas>
      </div>
    </div>
  );
}
