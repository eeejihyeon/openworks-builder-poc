export type ContainerType = 'default' | 'tabs' | 'slider' | 'buttons';

export type BuilderMode = 'edit' | 'view';

export type WidgetDataSelection = {
  type: string | null;
  dataKey: string | null;
  dataType: string | null;
  values: Record<string, string>;
};

export type ContainerWidget = {
  id: string;
  catalogId: string;
  data: WidgetDataSelection;
};

export type ContainerPanel = {
  id: string;
  label: string;
  widget: ContainerWidget | null;
};

export type ContainerEntity = {
  id: string;
  type: ContainerType;
  panels: ContainerPanel[];
  activePanelIndex: number;
};

export const createEmptyWidgetData = (): WidgetDataSelection => ({
  type: null,
  dataKey: null,
  dataType: null,
  values: {},
});
