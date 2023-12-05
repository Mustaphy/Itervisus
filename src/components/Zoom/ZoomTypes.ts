import { Accessor, Setter } from "solid-js";

export type ZoomProperties = {
  scale: Accessor<number>;
  setScale: Setter<number>;
}