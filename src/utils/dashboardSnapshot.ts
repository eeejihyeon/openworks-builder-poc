import type { Layout, LayoutItem } from "react-grid-layout";

import { MAX_GRID_COLS, MIN_GRID_COLS } from "@/constants/gridCols";
import { MAX_GRID_COL_WIDTH, MIN_GRID_COL_WIDTH } from "@/constants/gridColWidth";
import { MAX_GRID_GAP, MIN_GRID_GAP } from "@/constants/gridGap";
import {
  MAX_GRID_ROW_HEIGHT,
  MIN_GRID_ROW_HEIGHT,
} from "@/constants/gridRowHeight";
import type { DashboardSnapshot } from "@/types/dashboardSnapshot";
import { DASHBOARD_SNAPSHOT_VERSION } from "@/types/dashboardSnapshot";
import type { ForbiddenZone } from "@/types/forbiddenZone";
import { DEFAULT_FORBIDDEN_ZONES } from "@/constants/forbiddenZones";
import { cloneLayout } from "@/utils/layoutHistory";
import { cloneForbiddenZones } from "@/utils/forbiddenZone";

type DashboardStoreSlice = {
  layout: Layout;
  gridCols: number;
  gridGap: number;
  gridRowHeight: number;
  gridColWidth: number;
  isGridLinesVisible: boolean;
  forbiddenZones: ForbiddenZone[];
  isForbiddenZonesVisible: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const sanitizeLayoutItem = (item: LayoutItem): LayoutItem => {
  const sanitized: LayoutItem = {
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  };

  if (item.minW !== undefined) {
    sanitized.minW = item.minW;
  }

  if (item.maxW !== undefined) {
    sanitized.maxW = item.maxW;
  }

  if (item.minH !== undefined) {
    sanitized.minH = item.minH;
  }

  if (item.maxH !== undefined) {
    sanitized.maxH = item.maxH;
  }

  if (item.static !== undefined) {
    sanitized.static = item.static;
  }

  return sanitized;
};

const parseLayoutItem = (value: unknown): LayoutItem | null => {
  if (!isRecord(value) || typeof value.i !== "string") {
    return null;
  }

  if (
    !isFiniteNumber(value.x) ||
    !isFiniteNumber(value.y) ||
    !isFiniteNumber(value.w) ||
    !isFiniteNumber(value.h)
  ) {
    return null;
  }

  const item: LayoutItem = {
    i: value.i,
    x: value.x,
    y: value.y,
    w: value.w,
    h: value.h,
  };

  if (isFiniteNumber(value.minW)) {
    item.minW = value.minW;
  }

  if (isFiniteNumber(value.maxW)) {
    item.maxW = value.maxW;
  }

  if (isFiniteNumber(value.minH)) {
    item.minH = value.minH;
  }

  if (isFiniteNumber(value.maxH)) {
    item.maxH = value.maxH;
  }

  if (typeof value.static === "boolean") {
    item.static = value.static;
  }

  return item;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const parseForbiddenZone = (value: unknown): ForbiddenZone | null => {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  if (
    !isFiniteNumber(value.x) ||
    !isFiniteNumber(value.y) ||
    !isFiniteNumber(value.w) ||
    !isFiniteNumber(value.h)
  ) {
    return null;
  }

  return {
    id: value.id,
    x: value.x,
    y: value.y,
    w: value.w,
    h: value.h,
    ...(typeof value.label === "string" ? { label: value.label } : {}),
  };
};

const parseForbiddenZones = (value: unknown): ForbiddenZone[] => {
  if (!Array.isArray(value)) {
    return cloneForbiddenZones(DEFAULT_FORBIDDEN_ZONES);
  }

  const zones = value
    .map(parseForbiddenZone)
    .filter((zone): zone is ForbiddenZone => zone !== null);

  return zones.length > 0
    ? zones
    : cloneForbiddenZones(DEFAULT_FORBIDDEN_ZONES);
};

export const buildDashboardSnapshot = (
  state: DashboardStoreSlice,
): DashboardSnapshot => ({
  version: DASHBOARD_SNAPSHOT_VERSION,
  savedAt: new Date().toISOString(),
  layout: cloneLayout(state.layout).map(sanitizeLayoutItem),
  grid: {
    cols: state.gridCols,
    gap: state.gridGap,
    rowHeight: state.gridRowHeight,
    colWidth: state.gridColWidth,
    isGridLinesVisible: state.isGridLinesVisible,
    forbiddenZones: cloneForbiddenZones(state.forbiddenZones),
    isForbiddenZonesVisible: state.isForbiddenZonesVisible,
  },
});

export const serializeDashboardSnapshot = (snapshot: DashboardSnapshot) =>
  JSON.stringify(snapshot, null, 2);

export const parseDashboardSnapshot = (json: string): DashboardSnapshot => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("JSON 형식이 올바르지 않습니다.");
  }

  if (!isRecord(parsed)) {
    throw new Error("스냅샷 데이터가 객체가 아닙니다.");
  }

  if (parsed.version !== DASHBOARD_SNAPSHOT_VERSION) {
    throw new Error("지원하지 않는 스냅샷 버전입니다.");
  }

  if (!Array.isArray(parsed.layout)) {
    throw new Error("layout 배열이 없습니다.");
  }

  const layout = parsed.layout
    .map(parseLayoutItem)
    .filter((item): item is LayoutItem => item !== null);

  if (layout.length === 0) {
    throw new Error("유효한 layout 항목이 없습니다.");
  }

  if (!isRecord(parsed.grid)) {
    throw new Error("grid 설정이 없습니다.");
  }

  const grid = parsed.grid;

  if (
    !isFiniteNumber(grid.cols) ||
    !isFiniteNumber(grid.gap) ||
    !isFiniteNumber(grid.rowHeight) ||
    !isFiniteNumber(grid.colWidth) ||
    typeof grid.isGridLinesVisible !== "boolean"
  ) {
    throw new Error("grid 설정 값이 올바르지 않습니다.");
  }

  const forbiddenZones = parseForbiddenZones(grid.forbiddenZones);
  const isForbiddenZonesVisible =
    typeof grid.isForbiddenZonesVisible === "boolean"
      ? grid.isForbiddenZonesVisible
      : true;

  return {
    version: DASHBOARD_SNAPSHOT_VERSION,
    savedAt:
      typeof parsed.savedAt === "string"
        ? parsed.savedAt
        : new Date().toISOString(),
    layout,
    grid: {
      cols: clamp(grid.cols, MIN_GRID_COLS, MAX_GRID_COLS),
      gap: clamp(grid.gap, MIN_GRID_GAP, MAX_GRID_GAP),
      rowHeight: clamp(grid.rowHeight, MIN_GRID_ROW_HEIGHT, MAX_GRID_ROW_HEIGHT),
      colWidth: clamp(grid.colWidth, MIN_GRID_COL_WIDTH, MAX_GRID_COL_WIDTH),
      isGridLinesVisible: grid.isGridLinesVisible,
      forbiddenZones,
      isForbiddenZonesVisible,
    },
  };
};

export const buildSnapshotFilename = (savedAt: string) => {
  const timestamp = savedAt.replace(/[:.]/g, "-");

  return `dashboard-layout-${timestamp}.json`;
};

export const downloadJsonFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
