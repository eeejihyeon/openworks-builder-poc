import {
  useCallback,
  useMemo,
  useRef,
  type DragEvent,
  type ReactNode,
} from 'react';

import { CONTAINER_CATALOG } from '@/constants/containerCatalog';
import { CONTAINER_DRAG_MIME_TYPE } from '@/constants/gridDrop';
import { SIDEBAR_SECTION_ORDER } from '@/constants/uiButtonOrder';
import { filterWidgetsByContainerSize } from '@/constants/widgetCatalog';
import type { ContainerType } from '@/types/container';
import { useDashboardStore } from '@/store/useDashboardStore';
import WidgetDataForm from '@/components/widgets/WidgetDataForm';

import * as S from './ComponentSidebar.style';

const ComponentSidebar = () => {
  const addContainer = useDashboardStore((state) => state.addContainer);
  const setDraggingContainerType = useDashboardStore(
    (state) => state.setDraggingContainerType
  );
  const draggingContainerType = useDashboardStore(
    (state) => state.draggingContainerType
  );
  const selectedContainerId = useDashboardStore(
    (state) => state.selectedContainerId
  );
  const containers = useDashboardStore((state) => state.containers);
  const layout = useDashboardStore((state) => state.layout);
  const builderMode = useDashboardStore((state) => state.builderMode);
  const assignWidgetToSelectedContainer = useDashboardStore(
    (state) => state.assignWidgetToSelectedContainer
  );
  const clearWidgetFromActivePanel = useDashboardStore(
    (state) => state.clearWidgetFromActivePanel
  );
  const updateActiveWidgetData = useDashboardStore(
    (state) => state.updateActiveWidgetData
  );

  const isDraggedRef = useRef(false);

  const selectedContainer = selectedContainerId
    ? containers[selectedContainerId]
    : null;
  const selectedLayoutItem = selectedContainerId
    ? layout.find((item) => item.i === selectedContainerId)
    : null;

  const filteredWidgets = useMemo(() => {
    if (!selectedLayoutItem) {
      return [];
    }

    return filterWidgetsByContainerSize(
      selectedLayoutItem.w,
      selectedLayoutItem.h
    );
  }, [selectedLayoutItem]);

  const activeWidget =
    selectedContainer?.panels[selectedContainer.activePanelIndex]?.widget ??
    null;

  const handleClickAddContainer = useCallback(
    (containerType: ContainerType) => {
      if (isDraggedRef.current) {
        return;
      }

      addContainer(containerType);
    },
    [addContainer]
  );

  const handleDragStartContainer = useCallback(
    (containerType: ContainerType, event: DragEvent<HTMLButtonElement>) => {
      isDraggedRef.current = true;
      setDraggingContainerType(containerType);
      event.dataTransfer.setData(CONTAINER_DRAG_MIME_TYPE, containerType);
      event.dataTransfer.setData('text/plain', containerType);
      event.dataTransfer.effectAllowed = 'copy';
    },
    [setDraggingContainerType]
  );

  const handleDragEndContainer = useCallback(() => {
    setDraggingContainerType(null);

    window.setTimeout(() => {
      isDraggedRef.current = false;
    }, 0);
  }, [setDraggingContainerType]);

  const handleAssignWidget = useCallback(
    (widgetCatalogId: string) => {
      assignWidgetToSelectedContainer(widgetCatalogId);
    },
    [assignWidgetToSelectedContainer]
  );

  const sectionRenderers: Record<
    (typeof SIDEBAR_SECTION_ORDER)[number],
    () => ReactNode
  > = {
    containerTypes: () => (
      <>
        <div style={S.header}>
          <h2 style={S.title}>Container Type</h2>
          <p style={S.description}>
            선택 시 고정 기본 사이즈로 빈 컨테이너 자동 배치
          </p>
        </div>
        <div style={S.list}>
          {CONTAINER_CATALOG.map((item) => (
            <button
              key={item.id}
              type='button'
              draggable={builderMode === 'edit'}
              disabled={builderMode !== 'edit'}
              style={S.itemButton(draggingContainerType === item.id)}
              onClick={() => handleClickAddContainer(item.id)}
              onDragStart={(event) => handleDragStartContainer(item.id, event)}
              onDragEnd={handleDragEndContainer}
            >
              <span style={S.itemLabel}>{item.label}</span>
              <span style={S.itemDescription}>{item.description}</span>
              <span style={S.itemMeta}>
                {item.defaultW} × {item.defaultH} 칸
              </span>
            </button>
          ))}
        </div>
      </>
    ),
    widgetList: () => (
      <>
        <div style={S.sectionHeader}>
          <h2 style={S.title}>Widget List</h2>
          <p style={S.description}>
            {selectedLayoutItem
              ? `선택 컨테이너 ${selectedLayoutItem.w}×${selectedLayoutItem.h}와 일치하는 위젯만 표시`
              : '컨테이너를 선택하면 사이즈 일치 위젯이 표시됩니다'}
          </p>
        </div>
        <div style={S.list}>
          {!selectedContainerId && (
            <p style={S.emptyHint}>그리드에서 컨테이너를 선택하세요</p>
          )}
          {selectedContainerId && filteredWidgets.length === 0 && (
            <p style={S.emptyHint}>
              현재 사이즈와 일치하는 위젯이 없습니다
            </p>
          )}
          {filteredWidgets.map((item) => (
            <button
              key={item.id}
              type='button'
              disabled={builderMode !== 'edit'}
              style={S.itemButton(false)}
              onClick={() => handleAssignWidget(item.id)}
            >
              <span style={S.itemLabel}>{item.label}</span>
              <span style={S.itemDescription}>{item.description}</span>
              <span style={S.itemMeta}>
                {item.defaultW} × {item.defaultH} 칸
              </span>
            </button>
          ))}
          {builderMode === 'edit' && activeWidget && selectedContainerId && (
            <button
              type='button'
              style={S.clearButton}
              onClick={() => clearWidgetFromActivePanel(selectedContainerId)}
            >
              활성 패널 위젯 제거
            </button>
          )}
        </div>
      </>
    ),
    widgetDataForm: () => {
      if (builderMode !== 'edit' || !selectedContainerId || !activeWidget) {
        return null;
      }

      return (
        <WidgetDataForm
          value={activeWidget.data}
          onChange={(data) =>
            updateActiveWidgetData(selectedContainerId, data)
          }
        />
      );
    },
  };

  return (
    <aside style={S.sidebar}>
      {SIDEBAR_SECTION_ORDER.map((sectionId) => (
        <div key={sectionId}>{sectionRenderers[sectionId]()}</div>
      ))}
    </aside>
  );
};

export default ComponentSidebar;
