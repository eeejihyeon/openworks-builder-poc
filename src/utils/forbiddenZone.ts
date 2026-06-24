import type { Layout, LayoutItem } from "react-grid-layout";

import type { ForbiddenZone, ForbiddenZoneRect } from "@/types/forbiddenZone";

const scaleDimension = (
  value: number,
  fromCols: number,
  toCols: number,
  max: number,
) => {
  const scaled = Math.round((value * toCols) / fromCols);

  return Math.max(0, Math.min(scaled, max));
};

export const collidesRect = (
  first: ForbiddenZoneRect,
  second: ForbiddenZoneRect,
) =>
  first.x < second.x + second.w &&
  first.x + first.w > second.x &&
  first.y < second.y + second.h &&
  first.y + first.h > second.y;

export const layoutItemToRect = (item: LayoutItem): ForbiddenZoneRect => ({
  x: item.x,
  y: item.y,
  w: item.w,
  h: item.h,
});

export const forbiddenZoneToRect = (zone: ForbiddenZone): ForbiddenZoneRect => ({
  x: zone.x,
  y: zone.y,
  w: zone.w,
  h: zone.h,
});

export const overlapsForbiddenZone = (
  rect: ForbiddenZoneRect,
  zones: ForbiddenZone[],
) => zones.some((zone) => collidesRect(rect, forbiddenZoneToRect(zone)));

export const layoutItemOverlapsForbiddenZone = (
  item: LayoutItem,
  zones: ForbiddenZone[],
) => overlapsForbiddenZone(layoutItemToRect(item), zones);

export const layoutHasForbiddenOverlap = (
  layout: Layout,
  zones: ForbiddenZone[],
) => {
  if (zones.length === 0) {
    return false;
  }

  return layout.some((item) => layoutItemOverlapsForbiddenZone(item, zones));
};

export const cloneForbiddenZones = (zones: ForbiddenZone[]) =>
  zones.map((zone) => ({ ...zone }));

export const scaleForbiddenZones = (
  zones: ForbiddenZone[],
  fromCols: number,
  toCols: number,
): ForbiddenZone[] => {
  if (fromCols === toCols) {
    return cloneForbiddenZones(zones);
  }

  return zones.map((zone) => {
    const width = Math.max(
      1,
      scaleDimension(zone.w, fromCols, toCols, toCols),
    );
    const x = Math.max(
      0,
      Math.min(
        toCols - width,
        scaleDimension(zone.x, fromCols, toCols, toCols - width),
      ),
    );

    return {
      ...zone,
      x,
      w: width,
    };
  });
};
