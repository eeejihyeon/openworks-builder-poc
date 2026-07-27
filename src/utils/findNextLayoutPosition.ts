import type { Layout } from 'react-grid-layout';

import type { ForbiddenZone } from '@/types/forbiddenZone';
import { overlapsForbiddenZone } from '@/utils/forbiddenZone';

export const findNextLayoutPosition = (
  layout: Layout,
  width: number,
  height: number,
  cols: number,
  forbiddenZones: ForbiddenZone[] = [],
  maxRows?: number
) => {
  const layoutMaxY = layout.reduce(
    (max, item) => Math.max(max, item.y + item.h),
    0
  );
  const searchMaxY =
    maxRows === undefined
      ? layoutMaxY + 20
      : Math.max(0, maxRows - height);

  for (let y = 0; y <= searchMaxY; y += 1) {
    for (let x = 0; x <= cols - width; x += 1) {
      const candidate = { x, y, w: width, h: height };
      const isOverlapping = layout.some(
        (item) =>
          x < item.x + item.w &&
          x + width > item.x &&
          y < item.y + item.h &&
          y + height > item.y
      );

      if (!isOverlapping && !overlapsForbiddenZone(candidate, forbiddenZones)) {
        return { x, y };
      }
    }
  }

  return null;
};
