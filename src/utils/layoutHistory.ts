import type { Layout } from "react-grid-layout";

export const MAX_LAYOUT_HISTORY = 50;

export const cloneLayout = (layout: Layout): Layout =>
  layout.map((item) => ({ ...item }));

export const trimHistoryStack = (stack: Layout[]) => {
  if (stack.length <= MAX_LAYOUT_HISTORY) {
    return stack;
  }

  return stack.slice(stack.length - MAX_LAYOUT_HISTORY);
};

export const isSameLayout = (previous: Layout, next: Layout) => {
  if (previous.length !== next.length) {
    return false;
  }

  const previousMap = new Map(previous.map((item) => [item.i, item]));

  return next.every((item) => {
    const matched = previousMap.get(item.i);

    if (!matched) {
      return false;
    }

    return (
      matched.x === item.x &&
      matched.y === item.y &&
      matched.w === item.w &&
      matched.h === item.h
    );
  });
};

export const buildHistoryEntryLabel = (
  layout: Layout,
  index: number,
  previousLayout?: Layout,
) => {
  if (index === 0) {
    return "초기 상태";
  }

  const widgetCount = layout.length;

  if (!previousLayout) {
    return `액션 ${index} · 위젯 ${widgetCount}개`;
  }

  const previousCount = previousLayout.length;

  if (widgetCount > previousCount) {
    return `액션 ${index} · 위젯 추가 (${widgetCount}개)`;
  }

  if (widgetCount < previousCount) {
    return `액션 ${index} · 위젯 삭제 (${widgetCount}개)`;
  }

  return `액션 ${index} · 레이아웃 변경 (${widgetCount}개)`;
};
