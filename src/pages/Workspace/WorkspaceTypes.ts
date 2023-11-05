import { Drawable } from 'roughjs/bin/core';

export type Element = {
  id: number;
  type: Tool;
  drawable: Drawable;
  start: Coordinates;
  end: Coordinates;
  points?: Point[];
  offset?: Coordinates;
  xOffsets?: number[];
  yOffsets?: number[];
  mousePosition?: MousePosition;
  text?: string;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Placement = {
  start: Coordinates;
  end: Coordinates;
};

export type Tool = 'selection' | 'pencil' | 'line' | 'rectangle' | 'text';

export type Action = 'default' | 'drawing' | 'moving' | 'resizing' | 'writing';

export type MousePosition = 'inside' | 'start' | 'end' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
