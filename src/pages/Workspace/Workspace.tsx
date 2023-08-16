import { Component, createSignal } from 'solid-js';
import './Workspace.scss';

const Workspace: Component = () => {
  const [zoom, setZoom] = createSignal(1);

  const handleZoom = (event: WheelEvent) => {
    event.preventDefault();
    const newZoom = event.deltaY > 0 ? zoom() - 0.1 : zoom() + 0.1;
    setZoom(newZoom);
  };

  return (
    <>
      <div
        class="editor"
        onWheel={handleZoom}
        style={{ transform: `scale(${zoom()})` }}
      ></div>
    </>
  );
};

export default Workspace;
