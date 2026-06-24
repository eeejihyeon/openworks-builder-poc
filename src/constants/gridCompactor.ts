import type { Compactor, Layout, LayoutItem } from "react-grid-layout/core";
import {
  bottom,
  cloneLayout,
  collides,
  getFirstCollision,
  getStatics,
  resolveCompactionCollision,
  sortLayoutItemsByRowCol,
} from "react-grid-layout/core";

const MAX_RESOLVE_PASSES = 32;

const clearMovedFlags = (layout: Layout) => {
  layout.forEach((item) => {
    item.moved = false;
  });
};

const resolveOverlappingItems = (layout: Layout) => {
  const items = cloneLayout(layout);
  const compareWith: LayoutItem[] = [...getStatics(items)];
  let maxY = bottom(compareWith);
  const sorted = sortLayoutItemsByRowCol(items);

  for (let index = 0; index < sorted.length; index += 1) {
    const layoutItem = sorted[index];

    if (layoutItem === undefined || layoutItem.static) {
      continue;
    }

    layoutItem.x = Math.max(layoutItem.x, 0);
    layoutItem.y = Math.max(layoutItem.y, 0);
    layoutItem.y = Math.min(maxY, layoutItem.y);

    let collision = getFirstCollision(compareWith, layoutItem);

    while (collision !== undefined) {
      if (layoutItem.moved && !collision.static) {
        resolveCompactionCollision(
          items,
          collision,
          layoutItem.y + layoutItem.h,
          "y",
        );
      } else {
        resolveCompactionCollision(
          items,
          layoutItem,
          collision.y + collision.h,
          "y",
        );
      }

      collision = getFirstCollision(compareWith, layoutItem);
    }

    layoutItem.y = Math.max(layoutItem.y, 0);
    maxY = Math.max(maxY, layoutItem.y + layoutItem.h);
    compareWith.push(layoutItem);
  }

  clearMovedFlags(items);

  return items;
};

export const hasLayoutOverlaps = (layout: Layout) => {
  for (let index = 0; index < layout.length; index += 1) {
    const currentItem = layout[index];

    if (currentItem === undefined) {
      continue;
    }

    for (let nextIndex = index + 1; nextIndex < layout.length; nextIndex += 1) {
      const nextItem = layout[nextIndex];

      if (nextItem === undefined) {
        continue;
      }

      if (collides(currentItem, nextItem)) {
        return true;
      }
    }
  }

  return false;
};

export const pushWithoutCompactCompactor: Compactor = {
  type: "vertical",
  allowOverlap: false,
  preventCollision: false,
  compact(layout) {
    return cloneLayout(layout);
  },
};

export const resolveLayoutOverlaps = (layout: Layout, cols: number): Layout => {
  void cols;

  let resolvedLayout = cloneLayout(layout);

  for (let pass = 0; pass < MAX_RESOLVE_PASSES; pass += 1) {
    if (!hasLayoutOverlaps(resolvedLayout)) {
      break;
    }

    resolvedLayout = resolveOverlappingItems(resolvedLayout);
  }

  clearMovedFlags(resolvedLayout);

  return resolvedLayout;
};
