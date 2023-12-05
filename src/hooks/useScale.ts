import { createSignal, createEffect, onCleanup } from 'solid-js';
import { Coordinates } from '../pages/Workspace/WorkspaceTypes';

const useScale = () => {
  const [scale, setScale] = createSignal(1);
  const [scaleOffset, setScaleOffset] = createSignal({ x: 0, y: 0 });

  createEffect(() => {
    adjustScaleOffset();
  }, [scale]);

  onCleanup(() => {
    document.removeEventListener('wheel', updateScale);
  });

  const adjustScaleOffset = (): void => {
    const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
    const scaledWidth = canvas.width * scale();
    const scaledHeight = canvas.height * scale();
    const scaleOffsetX = (scaledWidth - canvas.width) / 2;
    const scaleOffsetY = (scaledHeight - canvas.height) / 2;
    const offsets = { x: scaleOffsetX, y: scaleOffsetY };

    setScaleOffset(offsets);
  };

  const updateScale = (event: WheelEvent) => {
    const delta = event.deltaY * -0.01;
    setScale((prevScale) => Math.min(Math.max(prevScale + delta, 0.1), 10));
  };

  document.addEventListener('wheel', updateScale);

  return { scale, setScale, scaleOffset };
};

export default useScale;