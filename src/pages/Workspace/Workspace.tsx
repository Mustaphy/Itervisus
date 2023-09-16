import { Component, Show, createEffect, createSignal } from 'solid-js';
import './Workspace.scss';
import rough from 'roughjs';
import { Coordinates, Action, Element, Tool, Position, Location } from './WorkspaceTypes';
import EmptyCursor from '../../assets/empty-cursor.svg';
import FilledCursor from '../../assets/filled-cursor.svg';
import EmptyLine from '../../assets/empty-line.svg';
import FilledLine from '../../assets/filled-line.svg';
import EmptySquare from '../../assets/empty-square.svg';
import FilledSquare from '../../assets/filled-square.svg';
import TrashCan from '../../assets/trash-can.svg';

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
    return elements()
      .map(element => ({ ...element, position: positionWithinElement(coordinates, element) }))
      .find(element => element.position !== null) as Element | undefined;
  }

  const positionWithinElement = (coordinates: Coordinates, element: Element): Position | null => {
    const { x: startX, y: startY } = element.start;
    const { x: endX, y: endY } = element.end;

    switch (element.tool) {
      case 'line': {
        const offset = distance(element.start, element.end) - distance(element.start, coordinates) - distance(element.end, coordinates);
        const start = isNearPosition(coordinates, element.start) ? 'start' : null;
        const end = isNearPosition(coordinates, element.end) ? 'end' : null;
        const inside = Math.abs(offset) < 1 ? 'inside' : null;

        return start || end || inside; 
      }

      case 'rectangle': {
        const topLeft = isNearPosition(coordinates, { x: startX, y: startY }) ? 'topLeft' : null;
        const topRight = isNearPosition(coordinates, { x: endX, y: startY }) ? 'topRight' : null;
        const bottomLeft = isNearPosition(coordinates, { x: startX, y: endY }) ? 'bottomLeft' : null;
        const bottomRight = isNearPosition(coordinates, { x: endX, y: endY }) ? 'bottomRight' : null;
        const inside = coordinates.x >= startX &&  coordinates.x <= endX && coordinates.y >= startY && coordinates.y <= endY ? 'inside' : null;

        return topLeft || topRight || bottomLeft || bottomRight || inside;
      }

      default:
        return null;
    }
  }

  const isNearPosition = (mouseCoordinates: Coordinates, elementCoordinates: Coordinates): boolean => {
    return Math.abs(mouseCoordinates.x - elementCoordinates.x) < 5 && Math.abs(mouseCoordinates.y - elementCoordinates.y) < 5;
  }

  const distance = (start: Coordinates, end: Coordinates): number => {
    return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
  }

  const cursorForPosition = (position: Position): string => {
    switch (position) {
      case 'inside':
        return 'move';

      case 'topLeft':
      case 'bottomRight':
      case 'start':
      case 'end':
        return 'nwse-resize';

      case 'topRight':
      case 'bottomLeft':
        return 'nesw-resize';

      default:
        return 'default';
    }
  }

  const adjustElementCoordinates = (element: Element) => {
    const { start, end, tool } = element;

    switch (tool) {
      case 'line': {
        if (start.x < end.x || (start.x == end.x && start.y < end.y))
          return { start, end };

        return { start: end, end: start };
      }

      case 'rectangle': {
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        return { start: { x: minX, y: minY }, end: { x: maxX, y: maxY } }; 
      }
    };
  }

  const resizedCoordinates = (mouseCoordinates: Coordinates, position: Position, elementLocation: Location): Location | undefined => {
    const { x: mouseX, y: mouseY } = mouseCoordinates;
    const { x: startX, y: startY } = elementLocation.start;
    const { x: endX, y: endY } = elementLocation.end;

    switch (position) {
      case 'topLeft':
      case 'start':
        return { start: mouseCoordinates, end: elementLocation.end };

      case 'topRight':
        return { start: { x: startX, y: mouseY }, end: { x: mouseX, y: endY } };

      case 'bottomLeft':
        return { start: { x: mouseX, y: startY }, end: { x: endX, y: mouseY } };

      case 'bottomRight':
      case 'end':
        return { start: elementLocation.start, end: mouseCoordinates };
    }
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

        if (element.position == 'inside')
          setAction('moving');
        else
          setAction('resizing');

        break;
      }

      case 'line':
      case 'rectangle':
        const element = createElement(elements().length, coordinates, coordinates, tool());

        setElements(previous => [...previous, element]);
        setSelectedElement(element);
        setAction('drawing');

        break;
    };
  };

  const handleMouseMove = (event: MouseEvent): void => {
    const { offsetX, offsetY } = event;

    if (tool() == 'selection') {
      if (event.target instanceof HTMLCanvasElement) {
        const element = getElementAtPosition({ x: offsetX, y: offsetY });

        event.target.style.cursor = element?.position
          ? cursorForPosition(element.position)
          : 'default';
      }
    }

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

      case 'resizing': {
        const { id, tool, position, start, end } = selectedElement()!;
        const { start: resizedStart, end: resizedEnd } = resizedCoordinates({ x: offsetX, y: offsetY }, position!, { start, end })!;

        updateElement(id, resizedStart, resizedEnd, tool);
      }
    };
  };

  const handleMouseUp = (event: MouseEvent): void => {
    const index = selectedElement()!.id;
    const { id, tool } = elements()[index];

    if (action() == 'drawing' || action() == 'resizing') {
      const { start, end } = adjustElementCoordinates(elements()[index])!;
      updateElement(id, start, end, tool);
    }

    setAction('default');
    setSelectedElement(null);

    if (event.target instanceof HTMLCanvasElement)
        event.target.style.cursor = 'default';
  };

  return (
    <>
      <div id="option-selection">
        <button onClick={() => setTool('selection')} class={` ${tool() == 'selection' ? 'active' : ''}`}>
          <Show when={tool() == 'selection'} fallback={<img src={EmptyCursor} alt="Cursor" />}>
            <img src={FilledCursor} alt="Cursor" />
          </Show>
        </button>

        <button onClick={() => setTool('line')} class={`${tool() == 'line' ? 'active' : ''}`}>
          <Show when={tool() == 'line'} fallback={<img src={EmptyLine} alt="Line" />}>
            <img src={FilledLine} alt="Line" />
          </Show>
        </button>

        <button onClick={() => setTool('rectangle')} class={`${tool() == 'rectangle' ? 'active' : ''}`}>
          <Show when={tool() == 'rectangle'} fallback={<img src={EmptySquare} alt="Square" />}>
            <img src={FilledSquare} alt="Square" />
          </Show>
        </button>

        <button onClick={() => setElements([])} class="action">
          <img src={TrashCan} alt="Square" />
        </button>
      </div>

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
