import { useCallback, useState } from 'react';

import {
  GRID_COLS_PRESETS,
  MAX_GRID_COLS,
  MIN_GRID_COLS,
} from '@/constants/gridCols';
import {
  GRID_GAP_PRESETS,
  MAX_GRID_GAP,
  MIN_GRID_GAP,
} from '@/constants/gridGap';
import {
  GRID_COL_WIDTH_PRESETS,
  MAX_GRID_COL_WIDTH,
  MIN_GRID_COL_WIDTH,
} from '@/constants/gridColWidth';
import {
  GRID_ROW_HEIGHT_PRESETS,
  MAX_GRID_ROW_HEIGHT,
  MIN_GRID_ROW_HEIGHT,
} from '@/constants/gridRowHeight';
import { useDashboardStore } from '@/store/useDashboardStore';

import UndoRedoControls from './UndoRedoControls';
import LayoutSaveControls from './LayoutSaveControls';

import * as S from './GridColsSettings.style';

const isColsPresetValue = (value: number) =>
  GRID_COLS_PRESETS.includes(value as (typeof GRID_COLS_PRESETS)[number]);

const isGapPresetValue = (value: number) =>
  GRID_GAP_PRESETS.includes(value as (typeof GRID_GAP_PRESETS)[number]);

const isRowHeightPresetValue = (value: number) =>
  GRID_ROW_HEIGHT_PRESETS.includes(
    value as (typeof GRID_ROW_HEIGHT_PRESETS)[number]
  );

const isColWidthPresetValue = (value: number) =>
  GRID_COL_WIDTH_PRESETS.includes(
    value as (typeof GRID_COL_WIDTH_PRESETS)[number]
  );

const clampGridCols = (value: number) =>
  Math.min(MAX_GRID_COLS, Math.max(MIN_GRID_COLS, value));

const clampGridGap = (value: number) =>
  Math.min(MAX_GRID_GAP, Math.max(MIN_GRID_GAP, value));

const clampGridRowHeight = (value: number) =>
  Math.min(MAX_GRID_ROW_HEIGHT, Math.max(MIN_GRID_ROW_HEIGHT, value));

const clampGridColWidth = (value: number) =>
  Math.min(MAX_GRID_COL_WIDTH, Math.max(MIN_GRID_COL_WIDTH, value));

const GridColsSettings = () => {
  const {
    gridCols,
    gridGap,
    gridRowHeight,
    gridColWidth,
    isGridLinesVisible,
    forbiddenZones,
    isForbiddenZonesVisible,
    setGridCols,
    setGridGap,
    setGridRowHeight,
    setGridColWidth,
    setGridLinesVisible,
    setForbiddenZonesVisible,
  } = useDashboardStore();
  const [customColsInput, setCustomColsInput] = useState(String(gridCols));
  const [customGapInput, setCustomGapInput] = useState(String(gridGap));
  const [customRowHeightInput, setCustomRowHeightInput] = useState(
    String(gridRowHeight)
  );
  const [customColWidthInput, setCustomColWidthInput] = useState(
    String(gridColWidth)
  );

  const handleClickColsPreset = useCallback(
    (cols: number) => {
      setCustomColsInput(String(cols));
      setGridCols(cols);
    },
    [setGridCols]
  );

  const handleChangeCustomColsInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomColsInput(event.target.value);
    },
    []
  );

  const handleCommitCustomColsInput = useCallback(() => {
    const parsed = Number.parseInt(customColsInput, 10);

    if (Number.isNaN(parsed)) {
      setCustomColsInput(String(gridCols));
      return;
    }

    const nextCols = clampGridCols(parsed);
    setGridCols(nextCols);
    setCustomColsInput(String(nextCols));
  }, [customColsInput, gridCols, setGridCols]);

  const handleKeyDownCustomColsInput = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCommitCustomColsInput();
      }
    },
    [handleCommitCustomColsInput]
  );

  const handleClickGapPreset = useCallback(
    (gap: number) => {
      setCustomGapInput(String(gap));
      setGridGap(gap);
    },
    [setGridGap]
  );

  const handleChangeCustomGapInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomGapInput(event.target.value);
    },
    []
  );

  const handleCommitCustomGapInput = useCallback(() => {
    const parsed = Number.parseInt(customGapInput, 10);

    if (Number.isNaN(parsed)) {
      setCustomGapInput(String(gridGap));
      return;
    }

    const nextGap = clampGridGap(parsed);
    setGridGap(nextGap);
    setCustomGapInput(String(nextGap));
  }, [customGapInput, gridGap, setGridGap]);

  const handleKeyDownCustomGapInput = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCommitCustomGapInput();
      }
    },
    [handleCommitCustomGapInput]
  );

  const handleClickRowHeightPreset = useCallback(
    (rowHeight: number) => {
      setCustomRowHeightInput(String(rowHeight));
      setGridRowHeight(rowHeight);
    },
    [setGridRowHeight]
  );

  const handleChangeCustomRowHeightInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomRowHeightInput(event.target.value);
    },
    []
  );

  const handleCommitCustomRowHeightInput = useCallback(() => {
    const parsed = Number.parseInt(customRowHeightInput, 10);

    if (Number.isNaN(parsed)) {
      setCustomRowHeightInput(String(gridRowHeight));
      return;
    }

    const nextRowHeight = clampGridRowHeight(parsed);
    setGridRowHeight(nextRowHeight);
    setCustomRowHeightInput(String(nextRowHeight));
  }, [customRowHeightInput, gridRowHeight, setGridRowHeight]);

  const handleKeyDownCustomRowHeightInput = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCommitCustomRowHeightInput();
      }
    },
    [handleCommitCustomRowHeightInput]
  );

  const handleClickColWidthPreset = useCallback(
    (colWidth: number) => {
      setCustomColWidthInput(String(colWidth));
      setGridColWidth(colWidth);
    },
    [setGridColWidth]
  );

  const handleChangeCustomColWidthInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomColWidthInput(event.target.value);
    },
    []
  );

  const handleCommitCustomColWidthInput = useCallback(() => {
    const parsed = Number.parseInt(customColWidthInput, 10);

    if (Number.isNaN(parsed)) {
      setCustomColWidthInput(String(gridColWidth));
      return;
    }

    const nextColWidth = clampGridColWidth(parsed);
    setGridColWidth(nextColWidth);
    setCustomColWidthInput(String(nextColWidth));
  }, [customColWidthInput, gridColWidth, setGridColWidth]);

  const handleKeyDownCustomColWidthInput = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCommitCustomColWidthInput();
      }
    },
    [handleCommitCustomColWidthInput]
  );

  const handleClickGridLines = useCallback(
    (isVisible: boolean) => {
      setGridLinesVisible(isVisible);
    },
    [setGridLinesVisible]
  );

  const handleClickForbiddenZones = useCallback(
    (isVisible: boolean) => {
      setForbiddenZonesVisible(isVisible);
    },
    [setForbiddenZonesVisible]
  );

  return (
    <div style={S.toolbar}>
      <UndoRedoControls />

      <div style={S.sectionDivider} />

      <LayoutSaveControls />

      <div style={S.sectionDivider} />

      <div style={S.settingSection}>
        <span style={S.label}>그리드 컬럼</span>
        <div style={S.presetGroup}>
          {GRID_COLS_PRESETS.map((preset) => (
            <button
              key={preset}
              type='button'
              style={S.presetButton(gridCols === preset)}
              onClick={() => handleClickColsPreset(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
        <div style={S.customGroup}>
          <span style={S.customLabel}>직접 입력</span>
          <input
            type='number'
            min={MIN_GRID_COLS}
            max={MAX_GRID_COLS}
            value={customColsInput}
            style={{
              ...S.customInput,
              ...(isColsPresetValue(gridCols)
                ? {}
                : {
                    borderColor: '#93c5fd',
                    backgroundColor: '#eff6ff',
                  }),
            }}
            onChange={handleChangeCustomColsInput}
            onBlur={handleCommitCustomColsInput}
            onKeyDown={handleKeyDownCustomColsInput}
          />
          <span style={S.currentValue}>현재 {gridCols}칸</span>
        </div>
      </div>

      <div style={S.sectionDivider} />

      <div style={S.settingSection}>
        <span style={S.label}>컬럼 간격</span>
        <div style={S.presetGroup}>
          {GRID_GAP_PRESETS.map((preset) => (
            <button
              key={preset}
              type='button'
              style={S.presetButton(gridGap === preset)}
              onClick={() => handleClickGapPreset(preset)}
            >
              {preset}px
            </button>
          ))}
        </div>
        <div style={S.customGroup}>
          <span style={S.customLabel}>직접 입력</span>
          <input
            type='number'
            min={MIN_GRID_GAP}
            max={MAX_GRID_GAP}
            value={customGapInput}
            style={{
              ...S.customInput,
              ...(isGapPresetValue(gridGap)
                ? {}
                : {
                    borderColor: '#93c5fd',
                    backgroundColor: '#eff6ff',
                  }),
            }}
            onChange={handleChangeCustomGapInput}
            onBlur={handleCommitCustomGapInput}
            onKeyDown={handleKeyDownCustomGapInput}
          />
          <span style={S.currentValue}>현재 {gridGap}px</span>
        </div>
      </div>

      <div style={S.sectionDivider} />

      <div style={S.settingSection}>
        <span style={S.label}>그리드 사이즈</span>
        <div style={S.sizeGroup}>
          <div style={S.sizeRow}>
            <span style={S.sizeLabel}>높이</span>
            <div style={S.presetGroup}>
              {GRID_ROW_HEIGHT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type='button'
                  style={S.presetButton(gridRowHeight === preset)}
                  onClick={() => handleClickRowHeightPreset(preset)}
                >
                  {preset}px
                </button>
              ))}
            </div>
            <div style={S.customGroup}>
              <span style={S.customLabel}>직접 입력</span>
              <input
                type='number'
                min={MIN_GRID_ROW_HEIGHT}
                max={MAX_GRID_ROW_HEIGHT}
                value={customRowHeightInput}
                style={{
                  ...S.customInput,
                  ...(isRowHeightPresetValue(gridRowHeight)
                    ? {}
                    : {
                        borderColor: '#93c5fd',
                        backgroundColor: '#eff6ff',
                      }),
                }}
                onChange={handleChangeCustomRowHeightInput}
                onBlur={handleCommitCustomRowHeightInput}
                onKeyDown={handleKeyDownCustomRowHeightInput}
              />
              <span style={S.currentValue}>현재 {gridRowHeight}px</span>
            </div>
          </div>
          <div style={S.sizeRow}>
            <span style={S.sizeLabel}>너비</span>
            <div style={S.presetGroup}>
              {GRID_COL_WIDTH_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type='button'
                  style={S.presetButton(gridColWidth === preset)}
                  onClick={() => handleClickColWidthPreset(preset)}
                >
                  {preset}px
                </button>
              ))}
            </div>
            <div style={S.customGroup}>
              <span style={S.customLabel}>직접 입력</span>
              <input
                type='number'
                min={MIN_GRID_COL_WIDTH}
                max={MAX_GRID_COL_WIDTH}
                value={customColWidthInput}
                style={{
                  ...S.customInput,
                  ...(isColWidthPresetValue(gridColWidth)
                    ? {}
                    : {
                        borderColor: '#93c5fd',
                        backgroundColor: '#eff6ff',
                      }),
                }}
                onChange={handleChangeCustomColWidthInput}
                onBlur={handleCommitCustomColWidthInput}
                onKeyDown={handleKeyDownCustomColWidthInput}
              />
              <span style={S.currentValue}>현재 {gridColWidth}px</span>
            </div>
          </div>
        </div>
      </div>

      <div style={S.sectionDivider} />

      <div style={S.settingSection}>
        <span style={S.label}>그리드 선</span>
        <div style={S.presetGroup}>
          <button
            type='button'
            style={S.presetButton(isGridLinesVisible)}
            onClick={() => handleClickGridLines(true)}
          >
            ON
          </button>
          <button
            type='button'
            style={S.presetButton(!isGridLinesVisible)}
            onClick={() => handleClickGridLines(false)}
          >
            OFF
          </button>
        </div>
      </div>

      <div style={S.sectionDivider} />

      {/* <div style={S.settingSection}>
        <span style={S.label}>배치 불가 영역</span>
        <div style={S.presetGroup}>
          <button
            type='button'
            style={S.presetButton(isForbiddenZonesVisible)}
            onClick={() => handleClickForbiddenZones(true)}
          >
            ON
          </button>
          <button
            type='button'
            style={S.presetButton(!isForbiddenZonesVisible)}
            onClick={() => handleClickForbiddenZones(false)}
          >
            OFF
          </button>
        </div>
        {forbiddenZones.length > 0 && (
          <ul style={S.zoneList}>
            {forbiddenZones.map((zone) => (
              <li key={zone.id} style={S.zoneListItem}>
                {zone.label ?? zone.id} · ({zone.x}, {zone.y}) {zone.w}×
                {zone.h}
              </li>
            ))}
          </ul>
        )}
      </div> */}
    </div>
  );
};

export default GridColsSettings;
