import { createSignal } from "solid-js";
import { Element } from "../pages/Workspace/WorkspaceTypes";

type History = [
  () => Element[],
  (action: Function | Element[], overwrite?: boolean) => void,
  () => void,
  () => void,
];

export const useHistory = (initialElements: Element[]): History => {
  const [index, setIndex] = createSignal(0);
  const [history, setHistory] = createSignal([initialElements]);

  const getState = () => history()[index()];

  const setState = (action: Function | Element[], overwrite = false) => {
    const newState = typeof action === 'function' ? action(history()[index()]) : action;

    // Overwriting if we don't want to add a new item to the history
    // For example, we don't want to add new items to the history when still dragging the element
    if (overwrite) {
      const historyCopy = [...history()];
      historyCopy[index()] = newState;
      setHistory(historyCopy);
      return; 
    }

    // Removing the future, if there is any
    const existingHistory = history().slice(0, index() + 1);
    setHistory([...existingHistory, newState]);
    setIndex(previousState => previousState + 1);
  }

  const undo = () => {
    index() > 0 && setIndex(previousState => previousState - 1);
  }

  const redo = () => {
    index() < history().length - 1 && setIndex(previousState => previousState + 1);
  }

  return [ getState, setState, undo, redo ];
}
