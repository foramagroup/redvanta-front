import { useRef } from "react";

export default function useUndoRedo(canvas) {
  const history = useRef([]);
  const cursor = useRef(-1);
  const max = 30;

  const saveState = () => {
    if (!canvas) return;

    const json = canvas.toJSON();

    if (cursor.current < history.current.length - 1) {
      history.current = history.current.slice(0, cursor.current + 1);
    }

    history.current.push(json);

    if (history.current.length > max) history.current.shift();
    else cursor.current++;

    // console.log("History length:", history.current.length);
  };

  const undo = () => {
    if (cursor.current <= 0) return;
    cursor.current--;

    canvas.loadFromJSON(history.current[cursor.current], () => {
      canvas.renderAll();
    });
  };

  const redo = () => {
    if (cursor.current >= history.current.length - 1) return;
    cursor.current++;

    canvas.loadFromJSON(history.current[cursor.current], () => {
      canvas.renderAll();
    });
  };

  return { saveState, undo, redo };
}
