import type { ForbiddenZone } from '@/types/forbiddenZone';
import {
  HEADER_ZONE_ID,
  HEADER_ZONE_LABEL,
  HEADER_ZONE_ROWS,
  SIDEBAR_ZONE_COLS,
  SIDEBAR_ZONE_ID,
  SIDEBAR_ZONE_LABEL,
} from '@/constants/reservedZones';

/**
 * Header/Sidebar 고정 노출 여부에 따라 현재 그리드(cols × rows) 위에서
 * 점유되는 예약 영역을 계산한다.
 *
 * - Header: 고정 노출 시 상단 HEADER_ZONE_ROWS행을 그리드 전체 너비로 점유
 * - Sidebar: 고정 노출 시 좌측 SIDEBAR_ZONE_COLS열을 그리드 전체 높이로 점유
 *
 * 두 영역 모두 현재 gridCols/gridRows에 맞춰 매번 새로 계산되므로,
 * 그리드 사이즈가 바뀌어도 항상 최신 상태를 반영한다.
 */
export const buildReservedZones = (
  gridCols: number,
  gridRows: number,
  isHeaderZoneFixed: boolean,
  isSidebarZoneFixed: boolean
): ForbiddenZone[] => {
  const zones: ForbiddenZone[] = [];

  if (isHeaderZoneFixed && gridRows > 0 && gridCols > 0) {
    const headerRows = Math.max(1, Math.min(HEADER_ZONE_ROWS, gridRows - 1));

    zones.push({
      id: HEADER_ZONE_ID,
      x: 0,
      y: 0,
      w: gridCols,
      h: headerRows,
      label: HEADER_ZONE_LABEL,
    });
  }

  if (isSidebarZoneFixed && gridCols > 0 && gridRows > 0) {
    const sidebarCols = Math.max(1, Math.min(SIDEBAR_ZONE_COLS, gridCols - 1));

    zones.push({
      id: SIDEBAR_ZONE_ID,
      x: 0,
      y: 0,
      w: sidebarCols,
      h: gridRows,
      label: SIDEBAR_ZONE_LABEL,
    });
  }

  return zones;
};

export const isReservedZoneId = (id: string) =>
  id === HEADER_ZONE_ID || id === SIDEBAR_ZONE_ID;
