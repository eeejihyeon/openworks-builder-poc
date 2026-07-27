import type { Layout } from 'react-grid-layout/legacy';

import type { ContainerEntity } from '@/types/container';
import type { ContainerLayoutPreset } from '@/types/preset';
import { cloneContainers } from '@/utils/dashboardSnapshot';
import { cloneLayout } from '@/utils/layoutHistory';

let presetSequence = 0;

export const buildPresetId = () => {
  presetSequence += 1;

  return `preset-${Date.now()}-${presetSequence}`;
};

export const clonePreset = (
  preset: ContainerLayoutPreset
): ContainerLayoutPreset => ({
  ...preset,
  layout: cloneLayout(preset.layout),
  containers: cloneContainers(preset.containers),
});

export const clonePresets = (
  presets: ContainerLayoutPreset[]
): ContainerLayoutPreset[] => presets.map(clonePreset);

export const createPresetFromElements = (
  name: string,
  layout: Layout,
  containers: Record<string, ContainerEntity>
): ContainerLayoutPreset => {
  const now = new Date().toISOString();

  return {
    id: buildPresetId(),
    name,
    layout: cloneLayout(layout),
    containers: cloneContainers(containers),
    createdAt: now,
    updatedAt: now,
  };
};
