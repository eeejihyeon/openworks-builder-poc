import type { ContainerType } from '@/types/container';

export type ContainerCatalogItem = {
  id: ContainerType;
  label: string;
  description: string;
  defaultW: number;
  defaultH: number;
  panelCount: number;
};

export const CONTAINER_CATALOG: ContainerCatalogItem[] = [
  {
    id: 'default',
    label: 'Default',
    description: '단일 위젯 슬롯',
    defaultW: 6,
    defaultH: 4,
    panelCount: 1,
  },
  {
    id: 'tabs',
    label: 'Tabs',
    description: '탭 전환 · 비활성 언마운트',
    defaultW: 6,
    defaultH: 6,
    panelCount: 3,
  },
  {
    id: 'slider',
    label: 'Slider',
    description: '좌우 스와이프 · 비활성 언마운트',
    defaultW: 6,
    defaultH: 4,
    panelCount: 3,
  },
  {
    id: 'buttons',
    label: 'Buttons',
    description: '버튼/위젯 클릭 시 링크 이동',
    defaultW: 4,
    defaultH: 4,
    panelCount: 3,
  },
];

export const getContainerCatalogItem = (containerType: ContainerType) =>
  CONTAINER_CATALOG.find((item) => item.id === containerType);

export const CONTAINER_TYPE_LABEL: Record<ContainerType, string> = {
  default: 'Default',
  tabs: 'Tabs',
  slider: 'Slider',
  buttons: 'Buttons',
};
