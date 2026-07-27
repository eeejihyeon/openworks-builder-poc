import type { ContainerEntity, ContainerType } from '@/types/container';
import { getContainerCatalogItem } from '@/constants/containerCatalog';

export const createContainerEntity = (
  id: string,
  type: ContainerType
): ContainerEntity => {
  const catalogItem = getContainerCatalogItem(type);
  const panelCount = catalogItem?.panelCount ?? 1;

  return {
    id,
    type,
    activePanelIndex: 0,
    panels: Array.from({ length: panelCount }, (_, index) => ({
      id: `${id}-panel-${index + 1}`,
      label: panelCount === 1 ? '메인' : `패널 ${index + 1}`,
      widget: null,
    })),
  };
};
