import type { Layout } from "react-grid-layout";

import type { ForbiddenZone } from "@/types/forbiddenZone";

export const DASHBOARD_SNAPSHOT_VERSION = 1;

export type DashboardGridSnapshot = {
  cols: number;
  gap: number;
  rowHeight: number;
  colWidth: number;
  isGridLinesVisible: boolean;
  forbiddenZones: ForbiddenZone[];
  isForbiddenZonesVisible: boolean;
};

export type DashboardSnapshot = {
  version: number;
  savedAt: string;
  layout: Layout;
  grid: DashboardGridSnapshot;
};
