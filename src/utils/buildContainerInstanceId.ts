import type { Layout } from 'react-grid-layout/legacy';

import type { ContainerType } from '@/types/container';

export const buildContainerInstanceId = (
  containerType: ContainerType,
  layout: Layout
) => {
  const prefix = `container-${containerType}`;
  const sameTypeCount = layout.filter((item) =>
    item.i.startsWith(`${prefix}-`)
  ).length;

  if (sameTypeCount === 0 && !layout.some((item) => item.i === prefix)) {
    return prefix;
  }

  return `${prefix}-${sameTypeCount + 1}`;
};

export const isContainerInstanceId = (instanceId: string) =>
  instanceId.startsWith('container-');
