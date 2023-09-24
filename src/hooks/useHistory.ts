import { createSignal } from "solid-js";
import { Element } from "../pages/Workspace/WorkspaceTypes";

type History = {
  elements: () => Element[],
  setElements: (action: Function | Element[], overwrite?: boolean) => void,
  undo: () => void,
  redo: () => void,
};

export const useHistory = (initialElements: Element[]): History => {
  const [index, setIndex] = createSignal(0);
  const [history, setHistory] = createSignal([initialElements]);

  const getElements = () => {
    return history()[index()];
  }

  const setElements = (action: Function | Element[], overwrite = false) => {
    const newState = typeof action === 'function' ? action(history()[index()]) : action;

    // Overwriting if we don't want to add a new item to the history
    // For example, we don't want to add new items to the history while dragging the element, only when it is dropped
    if (overwrite) {
      const historyCopy = [...history()];
      historyCopy[index()] = newState;
      setHistory(historyCopy);
      return; 
    }

    // Removing the future, if there is any
    // The future is erased when the user makes a new action after undoing
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

  return {
    elements: getElements,
    setElements,
    undo,
    redo
  };
}
