import { useCallback, useMemo, useState } from "react";

import { useDashboardStore } from "@/store/useDashboardStore";
import {
  buildHistoryEntryLabel,
  MAX_LAYOUT_HISTORY,
} from "@/utils/layoutHistory";

import * as S from "./GridColsSettings.style";

const UndoRedoControls = () => {
  const historyStack = useDashboardStore((state) => state.historyStack);
  const historyIndex = useDashboardStore((state) => state.historyIndex);
  const undo = useDashboardStore((state) => state.undo);
  const redo = useDashboardStore((state) => state.redo);
  const goToHistory = useDashboardStore((state) => state.goToHistory);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyStack.length - 1;

  const historyEntries = useMemo(
    () =>
      historyStack.map((entry, index) => ({
        index,
        label: buildHistoryEntryLabel(
          entry.layout,
          index,
          historyStack[index - 1]?.layout
        ),
        isActive: index === historyIndex,
      })),
    [historyIndex, historyStack]
  );

  const handleToggleHistory = useCallback(() => {
    setIsHistoryOpen((isOpen) => !isOpen);
  }, []);

  const handleClickHistoryItem = useCallback(
    (index: number) => {
      goToHistory(index);
    },
    [goToHistory],
  );

  return (
    <div style={S.historyControls}>
      <div style={S.historyActions}>
        <span style={S.label}>편집</span>
        <div style={S.historyActionRow}>
          <button
            type="button"
            style={S.historyButton(canUndo)}
            disabled={!canUndo}
            onClick={undo}
          >
            Undo
          </button>
          <button
            type="button"
            style={S.historyButton(canRedo)}
            disabled={!canRedo}
            onClick={redo}
          >
            Redo
          </button>
          <button
            type="button"
            style={S.historyToggleButton(isHistoryOpen)}
            onClick={handleToggleHistory}
          >
            히스토리
          </button>
        </div>
        <span style={S.currentValue}>
          {historyIndex + 1} / {historyStack.length} (최대 {MAX_LAYOUT_HISTORY})
          {" · "}Ctrl+Z / Ctrl+Shift+Z
        </span>
      </div>

      {isHistoryOpen && (
        <div style={S.historyPanel}>
          {historyEntries.map((entry) => (
            <button
              key={entry.index}
              type="button"
              style={S.historyItem(entry.isActive)}
              onClick={() => handleClickHistoryItem(entry.index)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UndoRedoControls;
