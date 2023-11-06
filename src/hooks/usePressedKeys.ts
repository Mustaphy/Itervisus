import { Accessor, createSignal, onCleanup } from "solid-js";

export const usePressedKeys = (): Accessor<Set<string>> => {
  const [pressedKeys, setPressedKeys] = createSignal(new Set<string>());

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    setPressedKeys(prevKeys => new Set(prevKeys).add(event.key));
    console.log(pressedKeys())
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    setPressedKeys(prevKeys => {
      const updatedKeys = new Set(prevKeys);
      updatedKeys.delete(event.key);
      return updatedKeys;
    });
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return pressedKeys;
};
