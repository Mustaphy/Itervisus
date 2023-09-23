import { Component, Show, createEffect, createSignal } from 'solid-js';
import './Workspace.scss';
import rough from 'roughjs';
import { Coordinates, Action, Element, Tool, MousePosition, Placement } from './WorkspaceTypes';
import EmptyCursor from '../../assets/empty-cursor.svg';
import FilledCursor from '../../assets/filled-cursor.svg';
import EmptyLine from '../../assets/empty-line.svg';
import FilledLine from '../../assets/filled-line.svg';
import EmptySquare from '../../assets/empty-square.svg';
import FilledSquare from '../../assets/filled-square.svg';
import Undo from '../../assets/undo.svg';
import Redo from '../../assets/redo.svg';
import TrashCan from '../../assets/trash-can.svg';
import { useHistory } from '../../hooks/useHistory';

const generator = rough.generator();

const Workspace: Component = () => {
  const [elements, setElements, undo, redo] = useHistory([] as Element[]);
  const [selectedElement, setSelectedElement] = createSignal(null as Element | null);
  const [action, setAction] = createSignal('default' as Action);
  const [tool, setTool] = createSignal('line' as Tool);

  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key == 'z') {
      // CTRL/CMD + SHIFT + Z
      if (event.shiftKey)
        redo();
      // CTRL/CMD + Z
      else
        undo();
    }
  })

  createEffect(() => {
    const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;    
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    elements().forEach(element => {
      roughCanvas.draw(element.drawable);
    });
  })

  const createElement = (id: number, start: Coordinates, end: Coordinates, type: Tool): Element => {
    const drawable = type === 'line'
      ? generator.line(start.x, start.y, end.x, end.y)
      : generator.rectangle(start.x, start.y, end.x - start.x, end.y - start.y);

    return {
      id,
      drawable,
      start,
      end,
      type 
    };
  }

  const updateElement = (id: number, start: Coordinates, end: Coordinates, type: Tool): void => {
    const updatedElement = createElement(id, start, end, type);

    const updatedElements = [...elements()];
    updatedElements[id] = updatedElement;
    
    setElements(updatedElements, true);
  }

  const getElementAtPosition = (coordinates: Coordinates): Element | null => {
    return elements()
      .map(element => ({ ...element, mousePosition: positionWithinElement(coordinates, element) }))
      .find(element => element.mousePosition !== null) as Element | null;
  }

  const positionWithinElement = (coordinates: Coordinates, element: Element): MousePosition | null => {
    switch (element.type) {
      case 'line': {
        const offset = distance(element.start, element.end) - distance(element.start, coordinates) - distance(element.end, coordinates);
        const start = isNearPosition(coordinates, element.start) ? 'start' : null;
        const end = isNearPosition(coordinates, element.end) ? 'end' : null;
        const inside = Math.abs(offset) < 1 ? 'inside' : null;

        return start || end || inside; 
      }

      case 'rectangle': {
        const { x: startX, y: startY } = element.start;
        const { x: endX, y: endY } = element.end;

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

  const cursorForPosition = (position: MousePosition): string => {
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

  const adjustElementCoordinates = (element: Element): Placement => {
    const { start, end, type } = element;

    switch (type) {
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

      default:
        return { start, end };
    };
  }

  const resizedCoordinates = (mouseCoordinates: Coordinates, elementStart: Coordinates, elementEnd: Coordinates, position: MousePosition): Placement | undefined => {
    const { x: mouseX, y: mouseY } = mouseCoordinates;
    const { x: startX, y: startY } = elementStart;
    const { x: endX, y: endY } = elementEnd;

    switch (position) {
      case 'topLeft':
      case 'start':
        return { start: mouseCoordinates, end: elementEnd };

      case 'topRight':
        return { start: { x: startX, y: mouseY }, end: { x: mouseX, y: endY } };

      case 'bottomLeft':
        return { start: { x: mouseX, y: startY }, end: { x: endX, y: mouseY } };

      case 'bottomRight':
      case 'end':
        return { start: elementStart, end: mouseCoordinates };
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
        // Creating a new entry in the history, so it is possible to undo and redo the movement
        setElements((previous: Element[]) => previous);

        if (element.mousePosition == 'inside')
          setAction('moving');
        else
          setAction('resizing');

        break;
      }

      case 'line':
      case 'rectangle':
        const element = createElement(elements().length, coordinates, coordinates, tool());

        setElements((previous: Element[]) => [...previous, element]);
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

        event.target.style.cursor = element?.mousePosition
          ? cursorForPosition(element.mousePosition)
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

        const { id, start, end, type, offset } = selectedElement()!;
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
        }, type);

        break;
      }

      case 'resizing': {
        const { id, type, mousePosition, start, end } = selectedElement()!;
        const { start: resizedStart, end: resizedEnd } = resizedCoordinates({ x: offsetX, y: offsetY }, start, end, mousePosition!)!;

        updateElement(id, resizedStart, resizedEnd, type);
      }
    };
  }

  const handleMouseUp = (event: MouseEvent): void => {
    const element = selectedElement();

    if (!element)
      return;

    const index = element.id;
    const { id, type } = elements()[index];

    if (action() == 'drawing' || action() == 'resizing') {
      const { start, end } = adjustElementCoordinates(elements()[index])!;
      updateElement(id, start, end, type);
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

        <button id="undo" onClick={undo}>
          <img src={Undo} alt="Undo" />
        </button>

        <button id="redo" onClick={redo}>
          <img src={Redo} alt="Redo" />
        </button>


        <button id="trash" onClick={() => setElements([])}>
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
  )
}

export default Workspace;
