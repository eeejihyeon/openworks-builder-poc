import { useCallback, useMemo, useState, type MouseEvent } from 'react';

import { useDashboardStore } from '@/store/useDashboardStore';

import * as S from './GridColsSettings.style';
import * as P from './PresetControls.style';

type SaveMode = 'none' | 'overwrite' | 'new';

/**
 * "컨테이너 배치" 프리셋 POC 컨트롤.
 *
 * - Preset 선택 → elements(layout+containers) 전체 overwrite + presetId 갱신
 * - elements 수정 → presetId는 스토어 쪽에서 즉시 null로 초기화됨(커스텀 판별 기준)
 * - Apply 저장 → 저장 안 함 / 기존 덮어쓰기 / 신규 추가 3분기
 * - 프리셋 삭제 → 참조 중이던 presetId를 null로 초기화(스토어에서 처리)
 */
const PresetControls = () => {
  const presets = useDashboardStore((state) => state.presets);
  const presetId = useDashboardStore((state) => state.presetId);
  const applyPreset = useDashboardStore((state) => state.applyPreset);
  const saveAsNewPreset = useDashboardStore((state) => state.saveAsNewPreset);
  const overwritePreset = useDashboardStore((state) => state.overwritePreset);
  const deletePreset = useDashboardStore((state) => state.deletePreset);

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>('none');
  const [overwriteTargetId, setOverwriteTargetId] = useState('');
  const [newPresetName, setNewPresetName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isDirty = presetId === null;
  const activePreset = useMemo(
    () => presets.find((item) => item.id === presetId) ?? null,
    [presets, presetId]
  );

  const handleClickApply = useCallback(() => {
    setIsSaveOpen((wasOpen) => {
      const nextOpen = !wasOpen;

      if (nextOpen) {
        setSaveMode(isDirty && presets.length > 0 ? 'overwrite' : isDirty ? 'new' : 'none');
        setOverwriteTargetId(presetId ?? presets[0]?.id ?? '');
        setNewPresetName('');
        setStatusMessage(null);
      }

      return nextOpen;
    });
  }, [isDirty, presetId, presets]);

  const handleSelectPreset = useCallback(
    (id: string) => {
      applyPreset(id);
      setIsSaveOpen(false);
      setStatusMessage(null);
    },
    [applyPreset]
  );

  const handleClickDeletePreset = useCallback(
    (id: string, event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      deletePreset(id);
      setStatusMessage('프리셋을 삭제했습니다.');
    },
    [deletePreset]
  );

  const handleConfirmSave = useCallback(() => {
    if (saveMode === 'none') {
      setIsSaveOpen(false);
      return;
    }

    if (saveMode === 'overwrite') {
      if (!overwriteTargetId) {
        setStatusMessage('덮어쓸 프리셋을 선택하세요.');
        return;
      }

      const isSucceeded = overwritePreset(overwriteTargetId);

      setStatusMessage(
        isSucceeded
          ? '기존 프리셋을 덮어썼습니다.'
          : '덮어쓸 프리셋을 찾지 못했습니다.'
      );

      if (isSucceeded) {
        setIsSaveOpen(false);
      }

      return;
    }

    const trimmedName = newPresetName.trim();

    if (!trimmedName) {
      setStatusMessage('프리셋 이름을 입력하세요.');
      return;
    }

    const newId = saveAsNewPreset(trimmedName);

    if (newId) {
      setStatusMessage(`"${trimmedName}" 프리셋을 새로 추가했습니다.`);
      setIsSaveOpen(false);
    }
  }, [saveMode, overwriteTargetId, overwritePreset, newPresetName, saveAsNewPreset]);

  return (
    <div style={P.container}>
      <div style={P.row}>
        <span style={S.label}>프리셋</span>
        <div style={P.presetList}>
          {presets.length === 0 && (
            <span style={S.currentValue}>저장된 프리셋 없음</span>
          )}
          {presets.map((preset) => (
            <div key={preset.id} style={P.presetItem(preset.id === presetId)}>
              <button
                type='button'
                style={P.presetItemButton(preset.id === presetId)}
                onClick={() => handleSelectPreset(preset.id)}
                title={`수정: ${new Date(preset.updatedAt).toLocaleString()}`}
              >
                {preset.name}
              </button>
              <button
                type='button'
                style={P.presetItemRemove}
                onClick={(event) => handleClickDeletePreset(preset.id, event)}
                title='프리셋 삭제'
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type='button'
          style={S.historyToggleButton(isSaveOpen)}
          onClick={handleClickApply}
        >
          Apply
        </button>
      </div>

      <span style={S.currentValue}>
        상태: {activePreset ? `"${activePreset.name}" 적용됨` : '커스텀(수정됨)'}
        {statusMessage ? ` · ${statusMessage}` : ''}
      </span>

      {isSaveOpen && (
        <div style={P.savePanel}>
          <label style={P.radioRow}>
            <input
              type='radio'
              name='preset-save-mode'
              checked={saveMode === 'none'}
              onChange={() => setSaveMode('none')}
            />
            <span>저장 안 함</span>
          </label>

          <label style={P.radioRow}>
            <input
              type='radio'
              name='preset-save-mode'
              checked={saveMode === 'overwrite'}
              disabled={presets.length === 0}
              onChange={() => setSaveMode('overwrite')}
            />
            <span>기존 덮어쓰기</span>
            <select
              style={P.select}
              disabled={saveMode !== 'overwrite' || presets.length === 0}
              value={overwriteTargetId}
              onChange={(event) => setOverwriteTargetId(event.target.value)}
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>

          <label style={P.radioRow}>
            <input
              type='radio'
              name='preset-save-mode'
              checked={saveMode === 'new'}
              onChange={() => setSaveMode('new')}
            />
            <span>신규 추가</span>
            <input
              type='text'
              placeholder='프리셋 이름'
              style={P.nameInput}
              disabled={saveMode !== 'new'}
              value={newPresetName}
              onChange={(event) => setNewPresetName(event.target.value)}
            />
          </label>

          <div style={P.savePanelActions}>
            <button
              type='button'
              style={S.historyButton(true)}
              onClick={() => setIsSaveOpen(false)}
            >
              취소
            </button>
            <button
              type='button'
              style={S.presetButton(true)}
              onClick={handleConfirmSave}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetControls;
