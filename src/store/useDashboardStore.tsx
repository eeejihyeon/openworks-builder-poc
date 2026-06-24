import { create } from 'zustand';

import type { Layout } from 'react-grid-layout/legacy';

import type { DashboardSnapshot } from '@/types/dashboardSnapshot';
import type { ForbiddenZone } from '@/types/forbiddenZone';

import { DEFAULT_GRID_COLS } from '@/constants/gridCols';
import { DEFAULT_GRID_COL_WIDTH } from '@/constants/gridColWidth';
import { DEFAULT_FORBIDDEN_ZONES } from '@/constants/forbiddenZones';
import { DEFAULT_GRID_GAP } from '@/constants/gridGap';
import { DEFAULT_GRID_ROW_HEIGHT } from '@/constants/gridRowHeight';
import { resolveLayoutOverlaps } from '@/constants/gridCompactor';
import { DROPPING_WIDGET_ID } from '@/constants/gridDrop';
import { getWidgetCatalogItem } from '@/constants/widgetCatalog';
import { buildWidgetInstanceId } from '@/utils/buildWidgetInstanceId';
import {
  buildDashboardSnapshot,
  parseDashboardSnapshot,
} from '@/utils/dashboardSnapshot';
import { findNextLayoutPosition } from '@/utils/findNextLayoutPosition';
import {
  cloneForbiddenZones,
  layoutHasForbiddenOverlap,
  layoutItemOverlapsForbiddenZone,
  scaleForbiddenZones,
} from '@/utils/forbiddenZone';
import {
  cloneLayout,
  isSameLayout,
  trimHistoryStack,
} from '@/utils/layoutHistory';
import { scaleLayout } from '@/utils/scaleLayout';

const INITIAL_LAYOUT: Layout = [
  {
    i: 'cctv',
    x: 0,
    y: 0,
    w: 6,
    h: 4,
    minW: 2,
    minH: 2,
  },
  {
    i: 'gas',
    x: 6,
    y: 0,
    w: 3,
    h: 4,
    minW: 2,
    minH: 2,
  },
  {
    i: 'weather',
    x: 9,
    y: 0,
    w: 3,
    h: 4,
    minW: 2,
    minH: 2,
  },
];

interface DashboardState {
  layout: Layout;
  historyStack: Layout[];
  historyIndex: number;
  gridCols: number;
  gridGap: number;
  gridRowHeight: number;
  gridColWidth: number;
  isGridLinesVisible: boolean;
  forbiddenZones: ForbiddenZone[];
  isForbiddenZonesVisible: boolean;
  draggingWidgetType: string | null;
  updateLayout: (layout: Layout) => void;
  commitLayout: (layout: Layout) => boolean;
  undo: () => void;
  redo: () => void;
  goToHistory: (index: number) => void;
  setGridCols: (gridCols: number) => void;
  setGridGap: (gridGap: number) => void;
  setGridRowHeight: (gridRowHeight: number) => void;
  setGridColWidth: (gridColWidth: number) => void;
  setGridLinesVisible: (isGridLinesVisible: boolean) => void;
  setForbiddenZonesVisible: (isForbiddenZonesVisible: boolean) => void;
  addWidget: (widgetType: string) => void;
  addWidgetAtPosition: (
    widgetType: string,
    position: { x: number; y: number; w: number; h: number }
  ) => void;
  placeWidgetFromDrop: (
    widgetType: string,
    gridLayout: Layout,
    droppedItem: Layout[number]
  ) => void;
  removeWidget: (widgetId: string) => void;
  setDraggingWidgetType: (widgetType: string | null) => void;
  exportSnapshotJson: () => DashboardSnapshot;
  loadSnapshotFromJson: (json: string) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  layout: INITIAL_LAYOUT,
  historyStack: [cloneLayout(INITIAL_LAYOUT)],
  historyIndex: 0,
  gridCols: DEFAULT_GRID_COLS,
  gridGap: DEFAULT_GRID_GAP,
  gridRowHeight: DEFAULT_GRID_ROW_HEIGHT,
  gridColWidth: DEFAULT_GRID_COL_WIDTH,
  isGridLinesVisible: false,
  forbiddenZones: cloneForbiddenZones(DEFAULT_FORBIDDEN_ZONES),
  isForbiddenZonesVisible: true,
  draggingWidgetType: null,

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
      historyStack,
      historyIndex,
      gridCols,
      forbiddenZones,
    } = get();
    const cleanedLayout = layout.filter(
      (item) => item.i !== DROPPING_WIDGET_ID
    );
    const resolvedLayout = resolveLayoutOverlaps(cleanedLayout, gridCols);

    if (layoutHasForbiddenOverlap(resolvedLayout, forbiddenZones)) {
      return false;
    }

    if (isSameLayout(currentLayout, resolvedLayout)) {
      return true;
    }

    const nextStack = trimHistoryStack([
      ...historyStack.slice(0, historyIndex + 1),
      cloneLayout(resolvedLayout),
    ]);

    set({
      layout: cloneLayout(resolvedLayout),
      historyStack: nextStack,
      historyIndex: nextStack.length - 1,
    });

    return true;
  },

  undo: () => {
    const { historyStack, historyIndex } = get();

    if (historyIndex <= 0) {
      return;
    }

    const nextIndex = historyIndex - 1;

    set({
      historyIndex: nextIndex,
      layout: cloneLayout(historyStack[nextIndex] ?? historyStack[0]),
    });
  },

  redo: () => {
    const { historyStack, historyIndex } = get();

    if (historyIndex >= historyStack.length - 1) {
      return;
    }

    const nextIndex = historyIndex + 1;

    set({
      historyIndex: nextIndex,
      layout: cloneLayout(
        historyStack[nextIndex] ?? historyStack[historyIndex]
      ),
    });
  },

  goToHistory: (index) => {
    const { historyStack, historyIndex } = get();

    if (index < 0 || index >= historyStack.length || index === historyIndex) {
      return;
    }

    set({
      historyIndex: index,
      layout: cloneLayout(historyStack[index]),
    });
  },

  setGridCols: (gridCols) => {
    const { layout, gridCols: currentGridCols, forbiddenZones } = get();

    if (gridCols === currentGridCols) {
      return;
    }

    get().commitLayout(scaleLayout(layout, currentGridCols, gridCols));

    set({
      gridCols,
      forbiddenZones: scaleForbiddenZones(
        forbiddenZones,
        currentGridCols,
        gridCols
      ),
    });
  },

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

  addWidget: (widgetType) => {
    const catalogItem = getWidgetCatalogItem(widgetType);

    if (!catalogItem) {
      return;
    }

    const { layout, gridCols, forbiddenZones } = get();
    const instanceId = buildWidgetInstanceId(widgetType, layout);
    const { x, y } = findNextLayoutPosition(
      layout,
      catalogItem.defaultW,
      catalogItem.defaultH,
      gridCols,
      forbiddenZones
    );

    get().commitLayout([
      ...layout,
      {
        i: instanceId,
        x,
        y,
        w: catalogItem.defaultW,
        h: catalogItem.defaultH,
      },
    ]);
  },

  addWidgetAtPosition: (widgetType, position) => {
    const catalogItem = getWidgetCatalogItem(widgetType);

    if (!catalogItem) {
      return;
    }

    const { layout, forbiddenZones } = get();
    const cleanedLayout = layout.filter(
      (item) => item.i !== DROPPING_WIDGET_ID
    );

    if (
      layoutItemOverlapsForbiddenZone(
        {
          i: DROPPING_WIDGET_ID,
          x: position.x,
          y: position.y,
          w: position.w,
          h: position.h,
        },
        forbiddenZones
      )
    ) {
      return;
    }

    const instanceId = buildWidgetInstanceId(widgetType, cleanedLayout);

    get().commitLayout([
      ...cleanedLayout,
      {
        i: instanceId,
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        minW: 2,
        minH: 2,
      },
    ]);
  },

  placeWidgetFromDrop: (widgetType, gridLayout, droppedItem) => {
    const catalogItem = getWidgetCatalogItem(widgetType);

    if (!catalogItem) {
      return;
    }

    const { forbiddenZones } = get();
    const cleanedLayout = gridLayout.filter(
      (item) => item.i !== DROPPING_WIDGET_ID
    );

    if (layoutItemOverlapsForbiddenZone(droppedItem, forbiddenZones)) {
      get().commitLayout(cleanedLayout);
      return;
    }

    const instanceId = buildWidgetInstanceId(widgetType, cleanedLayout);

    get().commitLayout([
      ...cleanedLayout,
      {
        i: instanceId,
        x: droppedItem.x,
        y: droppedItem.y,
        w: droppedItem.w,
        h: droppedItem.h,
        minW: 2,
        minH: 2,
      },
    ]);
  },

  removeWidget: (widgetId) => {
    const { layout } = get();
    const nextLayout = layout.filter((item) => item.i !== widgetId);

    if (nextLayout.length === layout.length) {
      return;
    }

    get().commitLayout(nextLayout);
  },

  setDraggingWidgetType: (draggingWidgetType) =>
    set({
      draggingWidgetType,
    }),

  exportSnapshotJson: () => {
    const state = get();

    return buildDashboardSnapshot({
      layout: state.layout,
      gridCols: state.gridCols,
      gridGap: state.gridGap,
      gridRowHeight: state.gridRowHeight,
      gridColWidth: state.gridColWidth,
      isGridLinesVisible: state.isGridLinesVisible,
      forbiddenZones: state.forbiddenZones,
      isForbiddenZonesVisible: state.isForbiddenZonesVisible,
    });
  },

  loadSnapshotFromJson: (json) => {
    const snapshot = parseDashboardSnapshot(json);
    const layout = cloneLayout(snapshot.layout);

    set({
      layout,
      historyStack: [cloneLayout(layout)],
      historyIndex: 0,
      gridCols: snapshot.grid.cols,
      gridGap: snapshot.grid.gap,
      gridRowHeight: snapshot.grid.rowHeight,
      gridColWidth: snapshot.grid.colWidth,
      isGridLinesVisible: snapshot.grid.isGridLinesVisible,
      forbiddenZones: cloneForbiddenZones(snapshot.grid.forbiddenZones),
      isForbiddenZonesVisible: snapshot.grid.isForbiddenZonesVisible,
    });
  },
}));
