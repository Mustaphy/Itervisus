import { Drawable } from 'roughjs/bin/core';

export type Element = {
  id: number;
  drawable: Drawable;
  start: Coordinates;
  end: Coordinates;
  tool: Tool;
  offset?: Coordinates;
  position?: Position;
};

export type Location = {
  start: Coordinates;
  end: Coordinates;
};

export type Coordinates = {
  x: number;
  y: number;
};

const tools = [
  'selection', 'line', 'rectangle'
] as const;
export type Tool = typeof tools[number];

const actions = [
  'default', 'drawing', 'moving', 'resizing'
] as const;
export type Action = typeof actions[number];

export type Position = 'inside' | 'start' | 'end' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
