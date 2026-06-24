import { useCallback, useRef, useState } from "react";

import { useDashboardStore } from "@/store/useDashboardStore";
import {
  buildSnapshotFilename,
  downloadJsonFile,
  serializeDashboardSnapshot,
} from "@/utils/dashboardSnapshot";

import * as S from "./GridColsSettings.style";

const LayoutSaveControls = () => {
  const exportSnapshotJson = useDashboardStore((state) => state.exportSnapshotJson);
  const loadSnapshotFromJson = useDashboardStore(
    (state) => state.loadSnapshotFromJson,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClickSaveJson = useCallback(() => {
    const snapshot = exportSnapshotJson();
    const content = serializeDashboardSnapshot(snapshot);

    downloadJsonFile(buildSnapshotFilename(snapshot.savedAt), content);
    setStatusMessage("JSON 파일을 저장했습니다.");
  }, [exportSnapshotJson]);

  const handleClickCopyJson = useCallback(async () => {
    const snapshot = exportSnapshotJson();
    const content = serializeDashboardSnapshot(snapshot);

    await navigator.clipboard.writeText(content);
    setStatusMessage("JSON을 클립보드에 복사했습니다.");
  }, [exportSnapshotJson]);

  const handleClickLoadJson = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleChangeFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      try {
        const content = await file.text();
        loadSnapshotFromJson(content);
        setStatusMessage(`${file.name} 파일을 불러왔습니다.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "JSON 불러오기에 실패했습니다.";

        setStatusMessage(message);
      } finally {
        event.target.value = "";
      }
    },
    [loadSnapshotFromJson],
  );

  return (
    <div style={S.settingSection}>
      <span style={S.label}>저장</span>
      <div style={S.presetGroup}>
        <button
          type="button"
          style={S.historyButton(true)}
          onClick={handleClickSaveJson}
        >
          JSON 저장
        </button>
        <button
          type="button"
          style={S.historyButton(true)}
          onClick={handleClickCopyJson}
        >
          복사
        </button>
        <button
          type="button"
          style={S.historyButton(true)}
          onClick={handleClickLoadJson}
        >
          불러오기
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={handleChangeFileInput}
      />
      {statusMessage && <span style={S.currentValue}>{statusMessage}</span>}
    </div>
  );
};

export default LayoutSaveControls;
