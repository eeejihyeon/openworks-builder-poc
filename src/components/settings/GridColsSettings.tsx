import { useCallback, useState, type ReactNode } from 'react';

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
import {
  GRID_ROWS_PRESETS,
  MAX_GRID_ROWS,
  MIN_GRID_ROWS,
} from '@/constants/gridRows';
import { useDashboardStore } from '@/store/useDashboardStore';

import {
  ADMIN_NAV_LABEL,
  DID_NAV_LABEL,
  HEADER_BUTTON_ORDER,
  VIEWER_NAV_LABEL,
} from '@/constants/uiButtonOrder';

import UndoRedoControls from './UndoRedoControls';
import LayoutSaveControls from './LayoutSaveControls';
import PresetControls from './PresetControls';
import AppSelector from './AppSelector';

import * as S from './GridColsSettings.style';

const isColsPresetValue = (value: number) =>
  GRID_COLS_PRESETS.includes(value as (typeof GRID_COLS_PRESETS)[number]);

const isRowsPresetValue = (value: number) =>
  GRID_ROWS_PRESETS.includes(value as (typeof GRID_ROWS_PRESETS)[number]);

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

const clampGridRows = (value: number) =>
  Math.min(MAX_GRID_ROWS, Math.max(MIN_GRID_ROWS, value));

const clampGridGap = (value: number) =>
  Math.min(MAX_GRID_GAP, Math.max(MIN_GRID_GAP, value));

const clampGridRowHeight = (value: number) =>
  Math.min(MAX_GRID_ROW_HEIGHT, Math.max(MIN_GRID_ROW_HEIGHT, value));

const clampGridColWidth = (value: number) =>
  Math.min(MAX_GRID_COL_WIDTH, Math.max(MIN_GRID_COL_WIDTH, value));

const GridColsSettings = () => {
  const {
    gridCols,
    gridRows,
    gridGap,
    gridRowHeight,
    gridColWidth,
    isGridLinesVisible,
    isCellAspectRatioLocked,
    isForbiddenZonesVisible,
    isHeaderZoneFixed,
    isSidebarZoneFixed,
    builderMode,
    setGridCols,
    setGridRows,
    setGridGap,
    setGridRowHeight,
    setGridColWidth,
    setGridLinesVisible,
    setCellAspectRatioLocked,
    setForbiddenZonesVisible,
    setHeaderZoneFixed,
    setSidebarZoneFixed,
    setBuilderMode,
    setCurrentPage,
  } = useDashboardStore();
  const [customColsInput, setCustomColsInput] = useState(String(gridCols));
  const [customRowsInput, setCustomRowsInput] = useState(String(gridRows));
  const [customGapInput, setCustomGapInput] = useState(String(gridGap));
  const [customRowHeightInput, setCustomRowHeightInput] = useState(
    String(gridRowHeight)
  );
  const [customColWidthInput, setCustomColWidthInput] = useState(
    String(gridColWidth)
  );

  // 앱 전환/프리셋 적용/스냅샷 불러오기 등 "외부에서" grid 설정 자체가
  // 통째로 교체되는 경우, 직접 입력 텍스트박스도 최신 값으로 맞춘다.
  // (렌더 중 상태 조정 패턴 — effect 대신 사용해 값이 바뀐 바로 그 렌더에
  // 반영하고, 사용자가 직접 입력 중인 값은 건드리지 않는다.)
  const [lastSyncedGridCols, setLastSyncedGridCols] = useState(gridCols);
  const [lastSyncedGridRows, setLastSyncedGridRows] = useState(gridRows);
  const [lastSyncedGridGap, setLastSyncedGridGap] = useState(gridGap);
  const [lastSyncedGridRowHeight, setLastSyncedGridRowHeight] =
    useState(gridRowHeight);
  const [lastSyncedGridColWidth, setLastSyncedGridColWidth] =
    useState(gridColWidth);

  if (gridCols !== lastSyncedGridCols) {
    setLastSyncedGridCols(gridCols);
    setCustomColsInput(String(gridCols));
  }

  if (gridRows !== lastSyncedGridRows) {
    setLastSyncedGridRows(gridRows);
    setCustomRowsInput(String(gridRows));
  }

  if (gridGap !== lastSyncedGridGap) {
    setLastSyncedGridGap(gridGap);
    setCustomGapInput(String(gridGap));
  }

  if (gridRowHeight !== lastSyncedGridRowHeight) {
    setLastSyncedGridRowHeight(gridRowHeight);
    setCustomRowHeightInput(String(gridRowHeight));
  }

  if (gridColWidth !== lastSyncedGridColWidth) {
    setLastSyncedGridColWidth(gridColWidth);
    setCustomColWidthInput(String(gridColWidth));
  }

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

  const handleClickRowsPreset = useCallback(
    (rows: number) => {
      setCustomRowsInput(String(rows));
      setGridRows(rows);
    },
    [setGridRows]
  );

  const handleChangeCustomRowsInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCustomRowsInput(event.target.value);
    },
    []
  );

  const handleCommitCustomRowsInput = useCallback(() => {
    const parsed = Number.parseInt(customRowsInput, 10);

    if (Number.isNaN(parsed)) {
      setCustomRowsInput(String(gridRows));
      return;
    }

    const nextRows = clampGridRows(parsed);
    setGridRows(nextRows);
    setCustomRowsInput(String(nextRows));
  }, [customRowsInput, gridRows, setGridRows]);

  const handleKeyDownCustomRowsInput = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCommitCustomRowsInput();
      }
    },
    [handleCommitCustomRowsInput]
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

  const handleClickCellAspectLock = useCallback(
    (isLocked: boolean) => {
      setCellAspectRatioLocked(isLocked);
    },
    [setCellAspectRatioLocked]
  );

  const headerSections: Record<(typeof HEADER_BUTTON_ORDER)[number], ReactNode> = {
    appSelector: <AppSelector />,
    undoRedo: <UndoRedoControls />,
    layoutSave: <LayoutSaveControls />,
    presetControls: <PresetControls />,
    builderMode: (
      <div style={S.settingSection}>
        <span style={S.label}>모드</span>
        <div style={S.presetGroup}>
          <button
            type='button'
            style={S.presetButton(builderMode === 'edit')}
            onClick={() => setBuilderMode('edit')}
          >
            편집
          </button>
          <button
            type='button'
            style={S.presetButton(builderMode === 'view')}
            onClick={() => setBuilderMode('view')}
          >
            뷰
          </button>
        </div>
      </div>
    ),
    gridCols: (
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
    ),
    gridRows: (
      <div style={S.settingSection}>
        <span style={S.label}>그리드 로우</span>
        <div style={S.presetGroup}>
          {GRID_ROWS_PRESETS.map((preset) => (
            <button
              key={preset}
              type='button'
              style={S.presetButton(gridRows === preset)}
              onClick={() => handleClickRowsPreset(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
        <div style={S.customGroup}>
          <span style={S.customLabel}>직접 입력</span>
          <input
            type='number'
            min={MIN_GRID_ROWS}
            max={MAX_GRID_ROWS}
            value={customRowsInput}
            style={{
              ...S.customInput,
              ...(isRowsPresetValue(gridRows)
                ? {}
                : {
                    borderColor: '#93c5fd',
                    backgroundColor: '#eff6ff',
                  }),
            }}
            onChange={handleChangeCustomRowsInput}
            onBlur={handleCommitCustomRowsInput}
            onKeyDown={handleKeyDownCustomRowsInput}
          />
          <span style={S.currentValue}>현재 {gridRows}줄</span>
        </div>
      </div>
    ),
    gridGap: (
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
    ),
    gridSize: (
      <div style={S.settingSection}>
        <span style={S.label}>그리드 사이즈</span>
        <div style={S.sizeGroup}>
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
          <div style={S.sizeRow}>
            <span style={S.sizeLabel}>높이</span>
            <div style={S.presetGroup}>
              {GRID_ROW_HEIGHT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type='button'
                  disabled={isCellAspectRatioLocked}
                  style={S.presetButton(
                    gridRowHeight === preset,
                    isCellAspectRatioLocked
                  )}
                  onClick={() => handleClickRowHeightPreset(preset)}
                  title={
                    isCellAspectRatioLocked
                      ? '비율 고정 ON — 높이는 너비의 3:2로 자동 산출됩니다'
                      : undefined
                  }
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
                disabled={isCellAspectRatioLocked}
                style={{
                  ...S.customInput,
                  ...(isCellAspectRatioLocked
                    ? { opacity: 0.5, cursor: 'not-allowed' }
                    : isRowHeightPresetValue(gridRowHeight)
                      ? {}
                      : {
                          borderColor: '#93c5fd',
                          backgroundColor: '#eff6ff',
                        }),
                }}
                onChange={handleChangeCustomRowHeightInput}
                onBlur={handleCommitCustomRowHeightInput}
                onKeyDown={handleKeyDownCustomRowHeightInput}
                title={
                  isCellAspectRatioLocked
                    ? '비율 고정 ON — 높이는 너비의 3:2로 자동 산출됩니다'
                    : undefined
                }
              />
              <span style={S.currentValue}>
                현재 {gridRowHeight}px
                {isCellAspectRatioLocked ? ' (3:2)' : ''}
              </span>
            </div>
          </div>
         
        </div>
      </div>
    ),
    gridLines: (
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
    ),
    cellAspectLock: (
      <div style={S.settingSection}>
        <span style={S.label}>비율 고정</span>
        <div style={S.presetGroup}>
          <button
            type='button'
            style={S.presetButton(isCellAspectRatioLocked)}
            onClick={() => handleClickCellAspectLock(true)}
            title='셀 높이를 너비 기준 3:2(aspect-ratio)로 산출합니다'
          >
            ON
          </button>
          <button
            type='button'
            style={S.presetButton(!isCellAspectRatioLocked)}
            onClick={() => handleClickCellAspectLock(false)}
            title='셀 높이를 명시적 rem/px 값으로 적용합니다'
          >
            OFF
          </button>
        </div>
      </div>
    ),
    reservedZones: (
      <div style={S.settingSection}>
        <span style={S.label}>Header/Sidebar 고정 노출</span>
        <div style={S.presetGroup}>
          <button
            type='button'
            style={S.presetButton(isHeaderZoneFixed)}
            onClick={() => setHeaderZoneFixed(!isHeaderZoneFixed)}
            title='고정 노출 시 상단 영역이 그리드를 점유해 컨테이너 배치가 제한됩니다'
          >
            Header {isHeaderZoneFixed ? 'ON' : 'OFF'}
          </button>
          <button
            type='button'
            style={S.presetButton(isSidebarZoneFixed)}
            onClick={() => setSidebarZoneFixed(!isSidebarZoneFixed)}
            title='고정 노출 시 좌측 영역이 그리드를 점유해 컨테이너 배치가 제한됩니다'
          >
            Sidebar {isSidebarZoneFixed ? 'ON' : 'OFF'}
          </button>
          <button
            type='button'
            style={S.presetButton(isForbiddenZonesVisible)}
            onClick={() => setForbiddenZonesVisible(!isForbiddenZonesVisible)}
            title='배치 불가 영역을 그리드 위에 시각적으로 표시합니다'
          >
            표시 {isForbiddenZonesVisible ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    ),
    viewerNav: (
      <div style={S.settingSection}>
        <button
          type='button'
          style={S.viewerNavButton}
          onClick={() => setCurrentPage('viewer')}
          title='설정 툴바 없이, 현재 창 크기에 맞는 브레이크포인트 그리드로 배치를 확인합니다'
        >
          {VIEWER_NAV_LABEL}
        </button>
      </div>
    ),
    didNav: (
      <div style={S.settingSection}>
        <button
          type='button'
          style={S.didNavButton}
          onClick={() => setCurrentPage('did')}
          title='실제 창/디바이스 해상도와 무관하게 1080×1920 고정 캔버스로 DID 배치를 확인합니다'
        >
          {DID_NAV_LABEL}
        </button>
      </div>
    ),
    adminNav: (
      <div style={S.settingSection}>
        <button
          type='button'
          style={S.adminNavButton}
          onClick={() => setCurrentPage('admin')}
        >
          {ADMIN_NAV_LABEL}
        </button>
      </div>
    ),
  };

  return (
    <div style={S.toolbar}>
      {HEADER_BUTTON_ORDER.map((buttonId, index) => (
        <div key={buttonId} style={{ display: 'contents' }}>
          {index > 0 && <div style={S.sectionDivider} />}
          {headerSections[buttonId]}
        </div>
      ))}
    </div>
  );
};

export default GridColsSettings;
