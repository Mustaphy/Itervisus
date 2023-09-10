import { Drawable } from 'roughjs/bin/core';

export type Element = {
  drawable: Drawable;
  start: Coordinates;
  end: Coordinates;
  tool: Tool;
};

export type Coordinates = {
  x: number;
  y: number;
};

const tools = [
  'line', 'rectangle'
] as const;
export type Tool = typeof tools[number];

const editorStates = [
  'default', 'drawing'
] as const;
export type EditorState = typeof editorStates[number];
