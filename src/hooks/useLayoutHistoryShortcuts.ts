import { useEffect } from "react";

import { useDashboardStore } from "@/store/useDashboardStore";

const useLayoutHistoryShortcuts = () => {
  const undo = useDashboardStore((state) => state.undo);
  const redo = useDashboardStore((state) => state.redo);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      const isInputTarget =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement;

      if (isInputTarget) {
        return;
      }

      if (event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if ((event.key === "z" && event.shiftKey) || event.key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [redo, undo]);
};

export default useLayoutHistoryShortcuts;
