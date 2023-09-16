import { Drawable } from 'roughjs/bin/core';

export type Element = {
  id: number;
  drawable: Drawable;
  start: Coordinates;
  end: Coordinates;
  type: Tool;
  offset?: Coordinates;
  mousePosition?: MousePosition;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type Placement = {
  start: Coordinates;
  end: Coordinates;
};

export type Tool = 'selection' | 'line' | 'rectangle';

export type Action = 'default' | 'drawing' | 'moving' | 'resizing';

export type MousePosition = 'inside' | 'start' | 'end' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

