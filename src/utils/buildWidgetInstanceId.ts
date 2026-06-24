import type { Layout } from "react-grid-layout";

export const buildWidgetInstanceId = (widgetType: string, layout: Layout) => {
  const sameTypeCount = layout.filter((item) =>
    item.i.startsWith(`${widgetType}-`),
  ).length;

  if (sameTypeCount === 0 && !layout.some((item) => item.i === widgetType)) {
    return widgetType;
  }

  return `${widgetType}-${sameTypeCount + 1}`;
};

export const resolveWidgetType = (instanceId: string) =>
  instanceId.split("-")[0];
