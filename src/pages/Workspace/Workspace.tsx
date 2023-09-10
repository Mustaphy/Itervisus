import { Component, createEffect, createSignal } from 'solid-js';
import './Workspace.scss';
import rough from 'roughjs';
import { Coordinates, EditorState, Element, Tool } from './WorkspaceTypes';

const generator = rough.generator();

const Workspace: Component = () => {
  const [elements, setElements] = createSignal([] as Element[]);
  const [state, setState] = createSignal('default' as EditorState);
  const [tool, setTool] = createSignal('line' as Tool);

  createEffect(() => {
    const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;    
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    elements().forEach(element => {
      roughCanvas.draw(element.drawable);
    });
  });

  const createElement = (start: Coordinates, end: Coordinates, type: Tool): Element => {
    const drawable = tool() === 'line'
      ? generator.line(start.x, start.y, end.x, end.y)
      : generator.rectangle(start.x, start.y, end.x - start.x, end.y - start.y);

    return {
      drawable,
      start,
      end,
      tool: type
    };
  };

  const handleMouseDown = (event: MouseEvent): void => {
    setState('drawing');

    const { offsetX, offsetY } = event;
    const element = createElement({ x: offsetX, y: offsetY }, { x: offsetX, y: offsetY }, tool());
    setElements(previous => [...previous, element]);
  };

  const handleMouseMove = (event: MouseEvent): void => {
    if (state() !== 'drawing')
      return;

    const { offsetX, offsetY } = event;
    const currentElement = elements()[elements().length - 1];
    const element = createElement(currentElement.start, { x: offsetX, y: offsetY }, tool());

    setElements(previous => [...previous.slice(0, -1), element]);
  };

  const handleMouseUp = (): void => {
    setState('default');
  };

  return (
    <>
      <div>
        <div>
          <input
            type="radio"
            id="line"
            name="tool"
            value="line"
            checked={tool() === 'line'}
            onChange={() => setTool('line')}
          />
          <label for="line">Line</label>
        </div>

        <div>
          <input
            type="radio"
            id="rectangle"
            name="tool"
            value="rectangle"
            checked={tool() === 'rectangle'}
            onChange={() => setTool('rectangle')}
          />
          <label for="rectangle">Rectangle</label>
        </div>
      </div>

        <button onClick={() => setElements([])}>Clear</button>

      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
      </canvas>
    </>
  );
};

export default Workspace;
