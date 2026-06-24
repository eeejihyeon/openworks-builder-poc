export type WidgetCatalogItem = {
  id: string;
  label: string;
  defaultW: number;
  defaultH: number;
};

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    id: 'cctv',
    label: 'CCTV',
    defaultW: 6,
    defaultH: 4,
  },
  {
    id: 'gas',
    label: '가스',
    defaultW: 3,
    defaultH: 4,
  },
  {
    id: 'weather',
    label: '날씨',
    defaultW: 3,
    defaultH: 4,
  },
  {
    id: 'chart',
    label: '차트',
    defaultW: 6,
    defaultH: 6,
  },
  {
    id: 'table',
    label: '테이블',
    defaultW: 6,
    defaultH: 6,
  },
  {
    id: 'map',
    label: '지도',
    defaultW: 4,
    defaultH: 4,
  },
  {
    id: 'alarm',
    label: '알람',
    defaultW: 4,
    defaultH: 6,
  },
  {
    id: 'status',
    label: '상태',
    defaultW: 4,
    defaultH: 4,
  },
];

export const getWidgetCatalogItem = (widgetType: string) =>
  WIDGET_CATALOG.find((item) => item.id === widgetType);
