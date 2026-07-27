import { create } from 'zustand';

import type { Layout } from 'react-grid-layout/legacy';

import type { DashboardSnapshot } from '@/types/dashboardSnapshot';
import type { ForbiddenZone } from '@/types/forbiddenZone';
import type {
  BuilderMode,
  ContainerEntity,
  ContainerType,
  WidgetDataSelection,
} from '@/types/container';
import { createEmptyWidgetData } from '@/types/container';
import type { ContainerLayoutPreset } from '@/types/preset';
import { type AppId, findBreakpointById } from '@/responsive/tokens/breakpoints';

import { DEFAULT_FORBIDDEN_ZONES } from '@/constants/forbiddenZones';
import { MAX_GRID_GAP } from '@/constants/gridGap';
import {
  MAX_GRID_ROW_HEIGHT,
  MIN_GRID_ROW_HEIGHT,
} from '@/constants/gridRowHeight';
import {
  MAX_GRID_COL_WIDTH,
  MIN_GRID_COL_WIDTH,
} from '@/constants/gridColWidth';
import { resolveLayoutOverlaps } from '@/constants/gridCompactor';
import { DROPPING_WIDGET_ID } from '@/constants/gridDrop';
import { getContainerCatalogItem } from '@/constants/containerCatalog';
import { getWidgetCatalogItem } from '@/constants/widgetCatalog';
import { buildContainerInstanceId } from '@/utils/buildContainerInstanceId';
import { createContainerEntity } from '@/utils/createContainerEntity';
import {
  buildDashboardSnapshot,
  cloneContainers,
  parseDashboardSnapshot,
} from '@/utils/dashboardSnapshot';
import { findNextLayoutPosition } from '@/utils/findNextLayoutPosition';
import {
  cloneForbiddenZones,
  layoutHasForbiddenOverlap,
  layoutItemOverlapsForbiddenZone,
  scaleForbiddenZones,
} from '@/utils/forbiddenZone';
import { buildReservedZones } from '@/utils/reservedZone';
import { HEADER_ZONE_ID, SIDEBAR_ZONE_ID } from '@/constants/reservedZones';
import {
  cloneLayout,
  isSameLayout,
  trimHistoryStack,
} from '@/utils/layoutHistory';
import { layoutExceedsMaxRows } from '@/utils/layoutBounds';
import { scaleLayout } from '@/utils/scaleLayout';
import { createPresetFromElements } from '@/utils/preset';

type HistoryEntry = {
  layout: Layout;
  containers: Record<string, ContainerEntity>;
  // 이 히스토리 스냅샷이 어떤 프리셋과 정확히 일치하는 상태인지 여부.
  // null이면 프리셋을 벗어난 커스텀 상태(수정됨)를 의미한다.
  presetId: string | null;
};

const INITIAL_LAYOUT: Layout = [];
const INITIAL_CONTAINERS: Record<string, ContainerEntity> = {};

const cloneHistoryEntry = (entry: HistoryEntry): HistoryEntry => ({
  layout: cloneLayout(entry.layout),
  containers: cloneContainers(entry.containers),
  presetId: entry.presetId,
});

/**
 * "앱(디바이스 프로필)"별로 독립적으로 유지되는 빌더 상태 조각.
 *
 * Mobile / Tablet Portrait / Tablet Landscape / Desktop 은 Col×Row 그리드
 * 형태 자체가 서로 다르므로(예: 6×20 vs 30×22) 하나의 layout/containers를
 * 공유할 수 없다. 앱을 전환할 때 현재 활성 앱의 상태를 이 조각으로 스냅샷해
 * `appSlices`에 캐시해두고, 전환 대상 앱의 조각을 최상위 필드로 복원하는
 * "mirror-on-switch" 방식을 사용한다. 이렇게 하면 기존의 모든 액션
 * (commitLayout/undo/addContainer 등)은 항상 "현재 활성 앱"의 최상위
 * 필드만 다루면 되므로 코드 변경 없이 그대로 재사용할 수 있다.
 */
interface AppSlice {
  layout: Layout;
  containers: Record<string, ContainerEntity>;
  historyStack: HistoryEntry[];
  historyIndex: number;
  presetId: string | null;
  presets: ContainerLayoutPreset[];
  gridCols: number;
  gridRows: number;
  gridGap: number;
  gridRowHeight: number;
  gridColWidth: number;
  forbiddenZones: ForbiddenZone[];
  isHeaderZoneFixed: boolean;
  isSidebarZoneFixed: boolean;
}

/** 앱을 처음 선택할 때, 이미지 스펙(Cell/Margin/Gutter/Col/Row)을 그대로
 * 반영한 초기 조각을 만든다. Cell/Gutter 값은 편집기 표시용 px 근사값으로
 * 사용되고(정확한 유동 스케일링은 뷰어 모드의 rem/clamp CSS가 담당), 실제
 * 디자인 검증 기준은 항상 breakpoints.ts 토큰이 단일 소스다. */
const createInitialAppSlice = (appId: AppId): AppSlice => {
  const bp = findBreakpointById(appId);
  const layout = cloneLayout(INITIAL_LAYOUT);
  const containers = cloneContainers(INITIAL_CONTAINERS);
  const gridGap = bp ? Math.min(MAX_GRID_GAP, bp.gutterPx) : 10;
  const gridRowHeight = bp
    ? Math.min(MAX_GRID_ROW_HEIGHT, Math.max(MIN_GRID_ROW_HEIGHT, bp.cellHeightPx))
    : 30;
  const gridColWidth = bp
    ? Math.min(MAX_GRID_COL_WIDTH, Math.max(MIN_GRID_COL_WIDTH, bp.cellWidthPx))
    : 50;

  return {
    layout,
    containers,
    historyStack: [cloneHistoryEntry({ layout, containers, presetId: null })],
    historyIndex: 0,
    presetId: null,
    presets: [],
    gridCols: bp?.col ?? 30,
    gridRows: bp?.row ?? 20,
    gridGap,
    gridRowHeight,
    gridColWidth,
    forbiddenZones: cloneForbiddenZones(DEFAULT_FORBIDDEN_ZONES),
    // Header/Sidebar 예약 영역(reservedZones.ts)은 30열×20행 기준으로
    // 설계되어 있어, 열 수가 적은 앱(예: Mobile 6열)에서 기본 ON으로
    // 두면 가용 영역이 거의 남지 않는다. 앱별로 필요 시 직접 켜도록
    // 기본은 꺼둔다.
    isHeaderZoneFixed: false,
    isSidebarZoneFixed: false,
  };
};

const DEFAULT_APP_ID: AppId = 'desktop';

const pruneContainersToLayout = (
  layout: Layout,
  containers: Record<string, ContainerEntity>
) => {
  const next: Record<string, ContainerEntity> = {};

  for (const item of layout) {
    if (item.i === DROPPING_WIDGET_ID) {
      continue;
    }

    const entity = containers[item.i];

    if (entity) {
      next[item.i] = entity;
    }
  }

  return next;
};

interface DashboardState {
  layout: Layout;
  containers: Record<string, ContainerEntity>;
  historyStack: HistoryEntry[];
  historyIndex: number;
  gridCols: number;
  gridRows: number;
  gridGap: number;
  gridRowHeight: number;
  gridColWidth: number;
  isGridLinesVisible: boolean;
  forbiddenZones: ForbiddenZone[];
  isForbiddenZonesVisible: boolean;
  // Header/Sidebar 고정 노출 여부 — 고정 노출 시 해당 영역이 그리드를 점유하며
  // 컨테이너는 남은 가용 영역에만 배치할 수 있다.
  isHeaderZoneFixed: boolean;
  isSidebarZoneFixed: boolean;
  draggingContainerType: ContainerType | null;
  selectedContainerId: string | null;
  builderMode: BuilderMode;
  currentPage: 'builder' | 'admin' | 'viewer' | 'did';
  // 저장된 "컨테이너 배치" 프리셋 목록.
  presets: ContainerLayoutPreset[];
  // 현재 elements(layout+containers)가 참조 중인 프리셋 id.
  // null이면 프리셋과 무관한 커스텀(수정됨) 상태.
  presetId: string | null;
  // 지금 빌더에서 편집 중인 "앱(디바이스 프로필)".
  activeAppId: AppId;
  // 비활성 앱들의 layout/containers/grid 설정 등을 캐시해두는 저장소.
  appSlices: Partial<Record<AppId, AppSlice>>;
  updateLayout: (layout: Layout) => void;
  commitLayout: (layout: Layout) => boolean;
  undo: () => void;
  redo: () => void;
  goToHistory: (index: number) => void;
  setGridCols: (gridCols: number) => void;
  setGridRows: (gridRows: number) => void;
  setGridGap: (gridGap: number) => void;
  setGridRowHeight: (gridRowHeight: number) => void;
  setGridColWidth: (gridColWidth: number) => void;
  setGridLinesVisible: (isGridLinesVisible: boolean) => void;
  setForbiddenZonesVisible: (isForbiddenZonesVisible: boolean) => void;
  setHeaderZoneFixed: (isHeaderZoneFixed: boolean) => void;
  setSidebarZoneFixed: (isSidebarZoneFixed: boolean) => void;
  getEffectiveForbiddenZones: () => ForbiddenZone[];
  setBuilderMode: (mode: BuilderMode) => void;
  setCurrentPage: (page: 'builder' | 'admin' | 'viewer' | 'did') => void;
  setSelectedContainerId: (containerId: string | null) => void;
  // 편집 중인 앱을 전환한다. 현재 앱의 상태를 appSlices에 스냅샷하고
  // 대상 앱의 상태(없으면 스펙 기반 초기값)를 최상위 필드로 복원한다.
  setActiveAppId: (appId: AppId) => void;
  // 뷰어 모드에서 "지금 활성 앱이 아닌" 다른 앱의 배치를 읽기 위한 getter.
  // (활성 앱을 바꾸지 않고 조회만 한다.)
  getAppSummary: (appId: AppId) => AppSummary;
  addContainer: (containerType: ContainerType) => void;
  placeContainerFromDrop: (
    containerType: ContainerType,
    gridLayout: Layout,
    droppedItem: Layout[number]
  ) => void;
  removeContainer: (containerId: string) => void;
  setDraggingContainerType: (containerType: ContainerType | null) => void;
  setActivePanel: (containerId: string, panelIndex: number) => void;
  assignWidgetToSelectedContainer: (widgetCatalogId: string) => void;
  clearWidgetFromActivePanel: (containerId: string) => void;
  updateActiveWidgetData: (
    containerId: string,
    data: WidgetDataSelection
  ) => void;
  exportSnapshotJson: () => DashboardSnapshot;
  loadSnapshotFromJson: (json: string) => void;
  // Preset 선택 시 elements(layout+containers) 전체를 덮어쓰고 presetId를 갱신한다.
  applyPreset: (presetId: string) => void;
  // "신규 추가" 분기: 현재 elements를 새 프리셋으로 저장하고 presetId를 갱신한다.
  saveAsNewPreset: (name: string) => string | null;
  // "기존 덮어쓰기" 분기: 현재 elements로 기존 프리셋을 덮어쓰고 presetId를 갱신한다.
  overwritePreset: (presetId: string) => boolean;
  // 프리셋 삭제. 삭제된 프리셋을 참조 중이던 현재 상태의 presetId는 null로 초기화한다.
  deletePreset: (presetId: string) => void;
}

/** getAppSummary()가 반환하는, 뷰어 렌더링에 필요한 최소 정보. */
export interface AppSummary {
  layout: Layout;
  containers: Record<string, ContainerEntity>;
  gridCols: number;
  gridRows: number;
  gridGap: number;
  gridRowHeight: number;
  gridColWidth: number;
}

const pushHistory = (
  get: () => DashboardState,
  set: (
    partial:
      | Partial<DashboardState>
      | ((state: DashboardState) => Partial<DashboardState>)
  ) => void,
  layout: Layout,
  containers: Record<string, ContainerEntity>,
  // 명시적으로 넘기지 않으면 "요소 수정"으로 간주해 커스텀(수정됨) 상태로
  // 전환한다. 프리셋을 적용하는 경우에만 해당 프리셋 id를 넘긴다.
  presetId: string | null = null
) => {
  const { historyStack, historyIndex } = get();
  const entry = cloneHistoryEntry({ layout, containers, presetId });
  const nextStack = trimHistoryStack([
    ...historyStack.slice(0, historyIndex + 1).map(cloneHistoryEntry),
    entry,
  ]);

  set({
    layout: cloneLayout(layout),
    containers: cloneContainers(containers),
    historyStack: nextStack,
    historyIndex: nextStack.length - 1,
    presetId,
  });
};

// history를 새로 쌓지 않고(=elements 자체는 그대로) presetId만 갱신해야 하는
// 경우(프리셋 신규 추가/덮어쓰기/삭제)에 사용. 현재 historyIndex가 가리키는
// 엔트리에도 동일하게 반영해 undo/redo 시 presetId 정합성을 유지한다.
const syncPresetId = (
  get: () => DashboardState,
  set: (
    partial:
      | Partial<DashboardState>
      | ((state: DashboardState) => Partial<DashboardState>)
  ) => void,
  presetId: string | null
) => {
  const { historyStack, historyIndex } = get();
  const nextStack = historyStack.map((entry, index) =>
    index === historyIndex ? { ...entry, presetId } : entry
  );

  set({ presetId, historyStack: nextStack });
};

const INITIAL_APP_SLICE = createInitialAppSlice(DEFAULT_APP_ID);

export const useDashboardStore = create<DashboardState>((set, get) => ({
  layout: INITIAL_APP_SLICE.layout,
  containers: INITIAL_APP_SLICE.containers,
  historyStack: INITIAL_APP_SLICE.historyStack,
  historyIndex: INITIAL_APP_SLICE.historyIndex,
  presets: INITIAL_APP_SLICE.presets,
  presetId: INITIAL_APP_SLICE.presetId,
  gridCols: INITIAL_APP_SLICE.gridCols,
  gridRows: INITIAL_APP_SLICE.gridRows,
  gridGap: INITIAL_APP_SLICE.gridGap,
  gridRowHeight: INITIAL_APP_SLICE.gridRowHeight,
  gridColWidth: INITIAL_APP_SLICE.gridColWidth,
  isGridLinesVisible: false,
  forbiddenZones: INITIAL_APP_SLICE.forbiddenZones,
  isForbiddenZonesVisible: true,
  isHeaderZoneFixed: INITIAL_APP_SLICE.isHeaderZoneFixed,
  isSidebarZoneFixed: INITIAL_APP_SLICE.isSidebarZoneFixed,
  draggingContainerType: null,
  selectedContainerId: null,
  builderMode: 'edit',
  currentPage: 'builder',
  activeAppId: DEFAULT_APP_ID,
  appSlices: {},

  updateLayout: (layout) => {
    const { layout: currentLayout, gridCols } = get();
    const hasDroppingItem = layout.some(
      (item) => item.i === DROPPING_WIDGET_ID
    );
    const nextLayout = hasDroppingItem
      ? cloneLayout(layout)
      : resolveLayoutOverlaps(layout, gridCols);

    if (isSameLayout(currentLayout, nextLayout)) {
      return;
    }

    set({
      layout: nextLayout,
    });
  },

  commitLayout: (layout) => {
    const {
      layout: currentLayout,
      containers,
      historyStack,
      historyIndex,
      gridCols,
      gridRows,
      selectedContainerId,
    } = get();
    const cleanedLayout = layout.filter(
      (item) => item.i !== DROPPING_WIDGET_ID
    );
    const resolvedLayout = resolveLayoutOverlaps(cleanedLayout, gridCols);
    const effectiveForbiddenZones = get().getEffectiveForbiddenZones();

    if (
      layoutHasForbiddenOverlap(resolvedLayout, effectiveForbiddenZones) ||
      layoutExceedsMaxRows(resolvedLayout, gridRows)
    ) {
      return false;
    }

    const nextContainers = pruneContainersToLayout(resolvedLayout, containers);

    if (
      isSameLayout(currentLayout, resolvedLayout) &&
      Object.keys(nextContainers).length === Object.keys(containers).length
    ) {
      return true;
    }

    // 레이아웃/컨테이너 구성이 바뀌는 명시적 커밋이므로 커스텀(수정됨)
    // 상태로 전환한다. (프리셋 적용은 이 경로를 쓰지 않고 applyPreset에서
    // presetId를 명시적으로 지정해 pushHistory를 직접 호출한다.)
    const entry = cloneHistoryEntry({
      layout: resolvedLayout,
      containers: nextContainers,
      presetId: null,
    });
    const nextStack = trimHistoryStack([
      ...historyStack.slice(0, historyIndex + 1).map(cloneHistoryEntry),
      entry,
    ]);

    const nextSelected =
      selectedContainerId && nextContainers[selectedContainerId]
        ? selectedContainerId
        : null;

    set({
      layout: cloneLayout(resolvedLayout),
      containers: cloneContainers(nextContainers),
      historyStack: nextStack,
      historyIndex: nextStack.length - 1,
      selectedContainerId: nextSelected,
      presetId: null,
    });

    return true;
  },

  undo: () => {
    const { historyStack, historyIndex } = get();

    if (historyIndex <= 0) {
      return;
    }

    const nextIndex = historyIndex - 1;
    const entry = historyStack[nextIndex] ?? historyStack[0];

    set({
      historyIndex: nextIndex,
      layout: cloneLayout(entry.layout),
      containers: cloneContainers(entry.containers),
      selectedContainerId: null,
      presetId: entry.presetId,
    });
  },

  redo: () => {
    const { historyStack, historyIndex } = get();

    if (historyIndex >= historyStack.length - 1) {
      return;
    }

    const nextIndex = historyIndex + 1;
    const entry = historyStack[nextIndex] ?? historyStack[historyIndex];

    set({
      historyIndex: nextIndex,
      layout: cloneLayout(entry.layout),
      containers: cloneContainers(entry.containers),
      selectedContainerId: null,
      presetId: entry.presetId,
    });
  },

  goToHistory: (index) => {
    const { historyStack, historyIndex } = get();

    if (index < 0 || index >= historyStack.length || index === historyIndex) {
      return;
    }

    const entry = historyStack[index];

    set({
      historyIndex: index,
      layout: cloneLayout(entry.layout),
      containers: cloneContainers(entry.containers),
      selectedContainerId: null,
      presetId: entry.presetId,
    });
  },

  setGridCols: (gridCols) => {
    const { layout, gridCols: currentGridCols, forbiddenZones } = get();

    if (gridCols === currentGridCols) {
      return;
    }

    const scaledLayout = scaleLayout(layout, currentGridCols, gridCols);

    // effective forbidden zones(Header/Sidebar 예약 영역 포함) 검증이
    // 새 gridCols 기준으로 이뤄지도록 먼저 grid 설정을 갱신한다.
    set({
      gridCols,
      forbiddenZones: scaleForbiddenZones(
        forbiddenZones,
        currentGridCols,
        gridCols
      ),
    });

    get().commitLayout(scaledLayout);
  },

  setGridRows: (gridRows) =>
    set({
      gridRows,
    }),

  setGridGap: (gridGap) =>
    set({
      gridGap,
    }),

  setGridRowHeight: (gridRowHeight) =>
    set({
      gridRowHeight,
    }),

  setGridColWidth: (gridColWidth) =>
    set({
      gridColWidth,
    }),

  setGridLinesVisible: (isGridLinesVisible) =>
    set({
      isGridLinesVisible,
    }),

  setForbiddenZonesVisible: (isForbiddenZonesVisible) =>
    set({
      isForbiddenZonesVisible,
    }),

  getEffectiveForbiddenZones: () => {
    const { forbiddenZones, gridCols, gridRows, isHeaderZoneFixed, isSidebarZoneFixed } =
      get();

    return [
      ...forbiddenZones,
      ...buildReservedZones(
        gridCols,
        gridRows,
        isHeaderZoneFixed,
        isSidebarZoneFixed
      ),
    ];
  },

  setHeaderZoneFixed: (isHeaderZoneFixed) => {
    if (isHeaderZoneFixed) {
      const { layout, gridCols, gridRows, isSidebarZoneFixed } = get();
      const zones = buildReservedZones(gridCols, gridRows, true, isSidebarZoneFixed);
      const headerZone = zones.find((zone) => zone.id === HEADER_ZONE_ID);

      // 이미 Header 예약 영역에 컨테이너가 있으면 고정 노출로 전환할 수 없음
      if (headerZone && layoutHasForbiddenOverlap(layout, [headerZone])) {
        return;
      }
    }

    set({ isHeaderZoneFixed });
  },

  setSidebarZoneFixed: (isSidebarZoneFixed) => {
    if (isSidebarZoneFixed) {
      const { layout, gridCols, gridRows, isHeaderZoneFixed } = get();
      const zones = buildReservedZones(gridCols, gridRows, isHeaderZoneFixed, true);
      const sidebarZone = zones.find((zone) => zone.id === SIDEBAR_ZONE_ID);

      // 이미 Sidebar 예약 영역에 컨테이너가 있으면 고정 노출로 전환할 수 없음
      if (sidebarZone && layoutHasForbiddenOverlap(layout, [sidebarZone])) {
        return;
      }
    }

    set({ isSidebarZoneFixed });
  },

  setBuilderMode: (builderMode) =>
    set({
      builderMode,
      selectedContainerId:
        builderMode === 'view' ? null : get().selectedContainerId,
    }),

  setCurrentPage: (currentPage) =>
    set({
      currentPage,
    }),

  setSelectedContainerId: (selectedContainerId) =>
    set({
      selectedContainerId,
    }),

  setActiveAppId: (appId) => {
    const state = get();

    if (appId === state.activeAppId) {
      return;
    }

    const currentSlice: AppSlice = {
      layout: state.layout,
      containers: state.containers,
      historyStack: state.historyStack,
      historyIndex: state.historyIndex,
      presetId: state.presetId,
      presets: state.presets,
      gridCols: state.gridCols,
      gridRows: state.gridRows,
      gridGap: state.gridGap,
      gridRowHeight: state.gridRowHeight,
      gridColWidth: state.gridColWidth,
      forbiddenZones: state.forbiddenZones,
      isHeaderZoneFixed: state.isHeaderZoneFixed,
      isSidebarZoneFixed: state.isSidebarZoneFixed,
    };

    const nextSlice = state.appSlices[appId] ?? createInitialAppSlice(appId);

    set({
      ...nextSlice,
      activeAppId: appId,
      appSlices: { ...state.appSlices, [state.activeAppId]: currentSlice },
      selectedContainerId: null,
      draggingContainerType: null,
    });
  },

  getAppSummary: (appId) => {
    const state = get();

    if (appId === state.activeAppId) {
      return {
        layout: state.layout,
        containers: state.containers,
        gridCols: state.gridCols,
        gridRows: state.gridRows,
        gridGap: state.gridGap,
        gridRowHeight: state.gridRowHeight,
        gridColWidth: state.gridColWidth,
      };
    }

    const slice = state.appSlices[appId] ?? createInitialAppSlice(appId);

    return {
      layout: slice.layout,
      containers: slice.containers,
      gridCols: slice.gridCols,
      gridRows: slice.gridRows,
      gridGap: slice.gridGap,
      gridRowHeight: slice.gridRowHeight,
      gridColWidth: slice.gridColWidth,
    };
  },

  addContainer: (containerType) => {
    const catalogItem = getContainerCatalogItem(containerType);

    if (!catalogItem) {
      return;
    }

    const { layout, containers, gridCols, gridRows } = get();
    const instanceId = buildContainerInstanceId(containerType, layout);
    const effectiveForbiddenZones = get().getEffectiveForbiddenZones();
    const position = findNextLayoutPosition(
      layout,
      catalogItem.defaultW,
      catalogItem.defaultH,
      gridCols,
      effectiveForbiddenZones,
      gridRows
    );

    if (!position) {
      return;
    }

    const entity = createContainerEntity(instanceId, containerType);
    const nextLayout: Layout = [
      ...layout,
      {
        i: instanceId,
        x: position.x,
        y: position.y,
        w: catalogItem.defaultW,
        h: catalogItem.defaultH,
        minW: 2,
        minH: 2,
      },
    ];
    const nextContainers = {
      ...containers,
      [instanceId]: entity,
    };

    pushHistory(get, set, nextLayout, nextContainers);
    set({ selectedContainerId: instanceId });
  },

  placeContainerFromDrop: (containerType, gridLayout, droppedItem) => {
    const catalogItem = getContainerCatalogItem(containerType);

    if (!catalogItem) {
      return;
    }

    const { containers, gridRows } = get();
    const cleanedLayout = gridLayout.filter(
      (item) => item.i !== DROPPING_WIDGET_ID
    );

    // 배치 시 고정 기본 사이즈 사용 (사이즈 결정권은 Container)
    const placedItem = {
      ...droppedItem,
      w: catalogItem.defaultW,
      h: catalogItem.defaultH,
    };
    const effectiveForbiddenZones = get().getEffectiveForbiddenZones();

    if (
      layoutItemOverlapsForbiddenZone(placedItem, effectiveForbiddenZones) ||
      placedItem.y + placedItem.h > gridRows
    ) {
      get().commitLayout(cleanedLayout);
      return;
    }

    const instanceId = buildContainerInstanceId(containerType, cleanedLayout);
    const entity = createContainerEntity(instanceId, containerType);

    const nextLayout: Layout = [
      ...cleanedLayout,
      {
        i: instanceId,
        x: placedItem.x,
        y: placedItem.y,
        w: catalogItem.defaultW,
        h: catalogItem.defaultH,
        minW: 2,
        minH: 2,
      },
    ];

    pushHistory(get, set, nextLayout, {
      ...containers,
      [instanceId]: entity,
    });
    set({ selectedContainerId: instanceId });
  },

  removeContainer: (containerId) => {
    const { layout, containers, selectedContainerId } = get();
    const nextLayout = layout.filter((item) => item.i !== containerId);

    if (nextLayout.length === layout.length) {
      return;
    }

    const rest = { ...containers };
    delete rest[containerId];

    pushHistory(get, set, nextLayout, rest);
    set({
      selectedContainerId:
        selectedContainerId === containerId ? null : selectedContainerId,
    });
  },

  setDraggingContainerType: (draggingContainerType) =>
    set({
      draggingContainerType,
    }),

  setActivePanel: (containerId, panelIndex) => {
    const { containers } = get();
    const entity = containers[containerId];

    if (!entity) {
      return;
    }

    if (panelIndex < 0 || panelIndex >= entity.panels.length) {
      return;
    }

    if (entity.activePanelIndex === panelIndex) {
      return;
    }

    set({
      containers: {
        ...containers,
        [containerId]: {
          ...entity,
          activePanelIndex: panelIndex,
        },
      },
    });
  },

  assignWidgetToSelectedContainer: (widgetCatalogId) => {
    const catalogItem = getWidgetCatalogItem(widgetCatalogId);

    if (!catalogItem) {
      return;
    }

    const { selectedContainerId, containers, layout } = get();

    if (!selectedContainerId) {
      return;
    }

    const entity = containers[selectedContainerId];
    const layoutItem = layout.find((item) => item.i === selectedContainerId);

    if (!entity || !layoutItem) {
      return;
    }

    // 컨테이너 현재 사이즈와 위젯 필수 사이즈가 일치할 때만 할당 (사이즈 불변)
    if (
      layoutItem.w !== catalogItem.defaultW ||
      layoutItem.h !== catalogItem.defaultH
    ) {
      return;
    }

    const panelIndex = entity.activePanelIndex;
    const panel = entity.panels[panelIndex];

    if (!panel) {
      return;
    }

    const nextPanels = entity.panels.map((item, index) =>
      index === panelIndex
        ? {
            ...item,
            widget: {
              id: `${selectedContainerId}-widget-${panelIndex + 1}`,
              catalogId: widgetCatalogId,
              data: createEmptyWidgetData(),
            },
          }
        : item
    );

    const nextContainers = {
      ...containers,
      [selectedContainerId]: {
        ...entity,
        panels: nextPanels,
      },
    };

    pushHistory(get, set, layout, nextContainers);
  },

  clearWidgetFromActivePanel: (containerId) => {
    const { containers, layout } = get();
    const entity = containers[containerId];

    if (!entity) {
      return;
    }

    const panelIndex = entity.activePanelIndex;
    const panel = entity.panels[panelIndex];

    if (!panel?.widget) {
      return;
    }

    const nextPanels = entity.panels.map((item, index) =>
      index === panelIndex ? { ...item, widget: null } : item
    );

    pushHistory(get, set, layout, {
      ...containers,
      [containerId]: {
        ...entity,
        panels: nextPanels,
      },
    });
  },

  updateActiveWidgetData: (containerId, data) => {
    const { containers } = get();
    const entity = containers[containerId];

    if (!entity) {
      return;
    }

    const panelIndex = entity.activePanelIndex;
    const panel = entity.panels[panelIndex];

    if (!panel?.widget) {
      return;
    }

    const nextPanels = entity.panels.map((item, index) =>
      index === panelIndex && item.widget
        ? {
            ...item,
            widget: {
              ...item.widget,
              data,
            },
          }
        : item
    );

    set({
      containers: {
        ...containers,
        [containerId]: {
          ...entity,
          panels: nextPanels,
        },
      },
      // 위젯 데이터도 "요소" 구성의 일부이므로 즉시 커스텀(수정됨) 상태로
      // 전환한다. (히스토리 스택에는 반영하지 않는 기존 동작은 유지)
      presetId: null,
    });
  },

  exportSnapshotJson: () => {
    const state = get();

    return buildDashboardSnapshot({
      layout: state.layout,
      containers: state.containers,
      gridCols: state.gridCols,
      gridRows: state.gridRows,
      gridGap: state.gridGap,
      gridRowHeight: state.gridRowHeight,
      gridColWidth: state.gridColWidth,
      isGridLinesVisible: state.isGridLinesVisible,
      forbiddenZones: state.forbiddenZones,
      isForbiddenZonesVisible: state.isForbiddenZonesVisible,
      isHeaderZoneFixed: state.isHeaderZoneFixed,
      isSidebarZoneFixed: state.isSidebarZoneFixed,
    });
  },

  loadSnapshotFromJson: (json) => {
    const snapshot = parseDashboardSnapshot(json);
    const layout = cloneLayout(snapshot.layout);
    const containers = cloneContainers(snapshot.containers);

    set({
      layout,
      containers,
      historyStack: [
        cloneHistoryEntry({ layout, containers, presetId: null }),
      ],
      historyIndex: 0,
      gridCols: snapshot.grid.cols,
      gridRows: snapshot.grid.rows,
      gridGap: snapshot.grid.gap,
      gridRowHeight: snapshot.grid.rowHeight,
      gridColWidth: snapshot.grid.colWidth,
      isGridLinesVisible: snapshot.grid.isGridLinesVisible,
      forbiddenZones: cloneForbiddenZones(snapshot.grid.forbiddenZones),
      isForbiddenZonesVisible: snapshot.grid.isForbiddenZonesVisible,
      isHeaderZoneFixed: snapshot.grid.isHeaderZoneFixed,
      isSidebarZoneFixed: snapshot.grid.isSidebarZoneFixed,
      selectedContainerId: null,
      // JSON 스냅샷 로드는 프리셋 적용이 아니므로 커스텀 상태로 취급한다.
      presetId: null,
    });
  },

  applyPreset: (presetId) => {
    const preset = get().presets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    // Preset 선택 시 elements(layout+containers) 전체를 덮어쓰고, 이 상태를
    // 히스토리에 커밋하면서 presetId를 해당 프리셋 id로 갱신한다.
    pushHistory(
      get,
      set,
      cloneLayout(preset.layout),
      cloneContainers(preset.containers),
      preset.id
    );
    set({ selectedContainerId: null });
  },

  saveAsNewPreset: (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return null;
    }

    const { layout, containers, presets } = get();
    const preset = createPresetFromElements(trimmedName, layout, containers);

    // "신규 추가" 분기: elements는 그대로이므로 히스토리는 새로 쌓지 않고
    // presets 목록에 추가 + presetId만 새 프리셋으로 갱신한다.
    set({ presets: [...presets, preset] });
    syncPresetId(get, set, preset.id);

    return preset.id;
  },

  overwritePreset: (presetId) => {
    const { layout, containers, presets } = get();
    const targetIndex = presets.findIndex((item) => item.id === presetId);

    if (targetIndex === -1) {
      return false;
    }

    const updatedPreset: ContainerLayoutPreset = {
      ...presets[targetIndex],
      layout: cloneLayout(layout),
      containers: cloneContainers(containers),
      updatedAt: new Date().toISOString(),
    };

    // "기존 덮어쓰기" 분기: 대상 프리셋의 내용을 현재 elements로 교체하고
    // presetId를 그 프리셋 id로 갱신한다.
    set({
      presets: presets.map((item, index) =>
        index === targetIndex ? updatedPreset : item
      ),
    });
    syncPresetId(get, set, presetId);

    return true;
  },

  deletePreset: (presetId) => {
    const { presets, presetId: currentPresetId } = get();
    const nextPresets = presets.filter((item) => item.id !== presetId);

    if (nextPresets.length === presets.length) {
      return;
    }

    set({ presets: nextPresets });

    // 삭제된 프리셋을 참조 중이던 현재 Page(단일 캔버스)의 presetId를
    // null로 초기화한다. (다중 Page/Container 확장 시 참조 중인 각
    // 엔티티를 순회하며 동일하게 초기화하면 된다.)
    if (currentPresetId === presetId) {
      syncPresetId(get, set, null);
    }
  },
}));
