import type { Layout } from 'react-grid-layout';

import type { ContainerEntity } from '@/types/container';
import type { ForbiddenZone } from '@/types/forbiddenZone';

export const DASHBOARD_SNAPSHOT_VERSION = 2;

export type DashboardGridSnapshot = {
  cols: number;
  rows: number;
  gap: number;
  rowHeight: number;
  colWidth: number;
  isGridLinesVisible: boolean;
  forbiddenZones: ForbiddenZone[];
  isForbiddenZonesVisible: boolean;
  isHeaderZoneFixed: boolean;
  isSidebarZoneFixed: boolean;
};

export type DashboardSnapshot = {
  version: number;
  savedAt: string;
  layout: Layout;
  containers: Record<string, ContainerEntity>;
  grid: DashboardGridSnapshot;
};
