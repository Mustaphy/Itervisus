import { Component, createEffect, createSignal } from 'solid-js';
import './Workspace.scss';
import rough from 'roughjs';
import { Coordinates, Action, Element, Tool } from './WorkspaceTypes';

const generator = rough.generator();

const Workspace: Component = () => {
  const [elements, setElements] = createSignal([] as Element[]);
  const [selectedElement, setSelectedElement] = createSignal(null as Element | null);
  const [action, setAction] = createSignal('default' as Action);
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

  const createElement = (id: number, start: Coordinates, end: Coordinates, type: Tool): Element => {
    const drawable = type === 'line'
      ? generator.line(start.x, start.y, end.x, end.y)
      : generator.rectangle(start.x, start.y, end.x - start.x, end.y - start.y);

    return {
      id,
      drawable,
      start,
      end,
      tool: type 
    };
  };

  const updateElement = (id: number, start: Coordinates, end: Coordinates, type: Tool) => {
    const updatedElement = createElement(id, start, end, type);

    const updatedElements = [...elements()];
    updatedElements[id] = updatedElement;
    
    setElements(updatedElements);
  }

  const getElementAtPosition = (coordinates: Coordinates): Element | undefined => {
    return elements().find(element => isWithinElement(coordinates, element)); 
  }

  const isWithinElement = (coordinates: Coordinates, element: Element): boolean => {
    const { x: startX, y: startY } = element.start;
    const { x: endX, y: endY } = element.end;

    switch (element.tool) {
      case 'line': {
        const offset = distance(element.start, element.end) - distance(element.start, coordinates) - distance(element.end, coordinates);

        return Math.abs(offset) < 1; 
      }
      case 'rectangle': {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        return startX >= minX &&  startX <= maxX && startY >= minY && startY <= maxY;
      }
      default:
        return false;
    }
  }

  const distance = (start: Coordinates, end: Coordinates): number => {
    return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
  }

  const handleMouseDown = (event: MouseEvent): void => {
    const { offsetX, offsetY } = event;
    const coordinates = { x: offsetX, y: offsetY };

    switch (tool()) {
      case 'selection': {
        const element = getElementAtPosition(coordinates);

        if (!element)
          return;

        const elementOffsetX = offsetX - element.start.x;
        const elementOffsetY = offsetY - element.start.y;
  
        setSelectedElement({ ...element, offset: { x: elementOffsetX, y: elementOffsetY } });
        setAction('moving');

        break;
      }

      case 'line':
      case 'rectangle':
        const element = createElement(elements().length, coordinates, coordinates, tool());

        setElements(previous => [...previous, element]);
        setAction('drawing');

        break;
    };
  };

  const handleMouseMove = (event: MouseEvent): void => {
    const { offsetX, offsetY } = event;

    if (tool() == 'selection')
      if (event.target instanceof HTMLCanvasElement)
        event.target.style.cursor = getElementAtPosition({ x: offsetX, y: offsetY })
          ? 'move'
          : 'default';

    switch (action()) {
      case 'drawing': {
        const index = elements().length - 1;
        const { start } = elements()[index];
        updateElement(index, start, { x: offsetX, y: offsetY }, tool());

        break;
      }

      case 'moving': {
        if (!selectedElement)
          return;

        const { id, start, end, tool, offset } = selectedElement()!;
        const width = end.x - start.x;
        const height = end.y - start.y;

        if (!offset)
          return;

        const coordinatesOffset = { x: offsetX - offset.x, y: offsetY - offset.y };

        updateElement(id, {
          x: coordinatesOffset.x,
          y: coordinatesOffset.y
        }, {
          x: coordinatesOffset.x + width,
          y: coordinatesOffset.y + height
        }, tool);

        break;
      }
    };
  };

  const handleMouseUp = (): void => {
    setAction('default');
    setSelectedElement(null);
  };

  return (
    <>
      <div>
        <div>
        <input
            type="radio"
            id="line"
            name="tool"
            value="selection"
            checked={tool() === 'selection'}
            onChange={() => setTool('selection')}
          />
          <label for="line">Selection</label>

          <input
            type="radio"
            id="line"
            name="tool"
            value="line"
            checked={tool() === 'line'}
            onChange={() => setTool('line')}
          />
          <label for="line">Line</label>

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
