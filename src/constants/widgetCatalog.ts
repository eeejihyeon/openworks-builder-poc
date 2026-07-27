export type WidgetCatalogItem = {
  id: string;
  label: string;
  description?: string;
  /** 컨테이너 사이즈와 일치해야 노출·할당되는 필수 크기 */
  defaultW: number;
  defaultH: number;
};

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    id: 'cctv',
    label: 'CCTV',
    description: '영상 스트림',
    defaultW: 6,
    defaultH: 4,
  },
  {
    id: 'gas',
    label: '가스',
    description: '가스 센서',
    defaultW: 3,
    defaultH: 4,
  },
  {
    id: 'weather',
    label: '날씨',
    description: '기상 정보',
    defaultW: 3,
    defaultH: 4,
  },
  {
    id: 'chart',
    label: '차트',
    description: '시계열 차트',
    defaultW: 6,
    defaultH: 6,
  },
  {
    id: 'table',
    label: '테이블',
    description: '데이터 테이블',
    defaultW: 6,
    defaultH: 6,
  },
  {
    id: 'map',
    label: '지도',
    description: '지도 타일',
    defaultW: 4,
    defaultH: 4,
  },
  {
    id: 'alarm',
    label: '알람',
    description: '알람 목록',
    defaultW: 4,
    defaultH: 6,
  },
  {
    id: 'status',
    label: '상태',
    description: '상태 카드',
    defaultW: 4,
    defaultH: 4,
  },
];

export const getWidgetCatalogItem = (widgetType: string) =>
  WIDGET_CATALOG.find((item) => item.id === widgetType);

export const filterWidgetsByContainerSize = (w: number, h: number) =>
  WIDGET_CATALOG.filter((item) => item.defaultW === w && item.defaultH === h);
