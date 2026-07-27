import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { GridBackground } from 'react-grid-layout/extras';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { pushWithoutCompactCompactor } from '@/constants/gridCompactor';
import { DROPPING_WIDGET_ID } from '@/constants/gridDrop';
import { DEFAULT_ROW_GAP } from '@/constants/gridGap';
import { getContainerCatalogItem } from '@/constants/containerCatalog';
import useLayoutHistoryShortcuts from '@/hooks/useLayoutHistoryShortcuts';
import { useDashboardStore } from '@/store/useDashboardStore';
import { calculateGridWidth } from '@/utils/calculateGridWidth';
import { cloneLayout, isSameLayout } from '@/utils/layoutHistory';
import { buildReservedZones } from '@/utils/reservedZone';

import ForbiddenZonesOverlay from './grid/ForbiddenZonesOverlay';
import GridContainer from './containers/GridContainer';
import GridColsSettings from './settings/GridColsSettings';
import ComponentSidebar from './sidebar/ComponentSidebar';

import * as S from './Builder.style';

const DRAG_CONFIG = { enabled: true, handle: '.widget-drag-handle' };
const RESIZE_CONFIG = { enabled: true };
const DROP_CONFIG = { enabled: true };
const GRID_COMPACTOR = pushWithoutCompactCompactor;
const GRID_LINE_COLOR = '#e2e8f0';

const buildInitialLayout = () =>
  cloneLayout(useDashboardStore.getState().layout);

const containerHasAnyWidget = (
  containerId: string,
  containers: ReturnType<typeof useDashboardStore.getState>['containers']
) => {
  const entity = containers[containerId];

  if (!entity) {
    return false;
  }

  return entity.panels.some((panel) => panel.widget != null);
};

const Builder = () => {
  const gridCols = useDashboardStore((state) => state.gridCols);
  const gridRows = useDashboardStore((state) => state.gridRows);
  const gridGap = useDashboardStore((state) => state.gridGap);
  const gridRowHeight = useDashboardStore((state) => state.gridRowHeight);
  const gridColWidth = useDashboardStore((state) => state.gridColWidth);
  const isGridLinesVisible = useDashboardStore(
    (state) => state.isGridLinesVisible
  );
  const forbiddenZones = useDashboardStore((state) => state.forbiddenZones);
  const isForbiddenZonesVisible = useDashboardStore(
    (state) => state.isForbiddenZonesVisible
  );
  const isHeaderZoneFixed = useDashboardStore(
    (state) => state.isHeaderZoneFixed
  );
  const isSidebarZoneFixed = useDashboardStore(
    (state) => state.isSidebarZoneFixed
  );
  const containers = useDashboardStore((state) => state.containers);
  const selectedContainerId = useDashboardStore(
    (state) => state.selectedContainerId
  );
  const builderMode = useDashboardStore((state) => state.builderMode);
  const commitLayout = useDashboardStore((state) => state.commitLayout);
  const placeContainerFromDrop = useDashboardStore(
    (state) => state.placeContainerFromDrop
  );
  const removeContainer = useDashboardStore((state) => state.removeContainer);
  const setDraggingContainerType = useDashboardStore(
    (state) => state.setDraggingContainerType
  );
  const draggingContainerType = useDashboardStore(
    (state) => state.draggingContainerType
  );
  const setSelectedContainerId = useDashboardStore(
    (state) => state.setSelectedContainerId
  );
  const setActivePanel = useDashboardStore((state) => state.setActivePanel);

  const [mountedLayout, setMountedLayout] = useState(buildInitialLayout);
  const [gridKey, setGridKey] = useState(0);
  const isGridInteractingRef = useRef(false);

  useLayoutHistoryShortcuts();
  const { containerRef, mounted } = useContainerWidth();

  const remountGrid = useCallback((layout: Layout) => {
    setMountedLayout(cloneLayout(layout));
    setGridKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!draggingContainerType) {
      isGridInteractingRef.current = false;
    }
  }, [draggingContainerType]);

  useEffect(
    () =>
      useDashboardStore.subscribe((state, previousState) => {
        if (isGridInteractingRef.current || state.draggingContainerType) {
          return;
        }

        if (isSameLayout(state.layout, previousState.layout)) {
          return;
        }

        remountGrid(state.layout);
      }),
    [remountGrid]
  );

  const visibleLayout = useMemo(() => {
    const baseLayout =
      builderMode === 'edit'
        // 편집 모드: container 엔티티 존재 기준
        ? mountedLayout.filter((item) => Boolean(containers[item.i]))
        // 뷰 모드: container.widget 존재 기준
        : mountedLayout.filter((item) =>
            containerHasAnyWidget(item.i, containers)
          );

    // 위젯이 배치된 컨테이너는 사이즈 결정권이 컨테이너에 고정되므로
    // 드래그(위치 이동)는 허용하되 리사이즈는 잠가 위젯과 함께 크기가
    // 바뀌지 않도록 한다.
    return baseLayout.map((item) => ({
      ...item,
      isResizable: !containerHasAnyWidget(item.i, containers),
    }));
  }, [builderMode, containers, mountedLayout]);

  const droppingItem = useMemo<LayoutItem>(() => {
    const catalogItem = draggingContainerType
      ? getContainerCatalogItem(draggingContainerType)
      : null;

    return {
      i: DROPPING_WIDGET_ID,
      x: 0,
      y: 0,
      w: catalogItem?.defaultW ?? 6,
      h: catalogItem?.defaultH ?? 4,
    };
  }, [draggingContainerType]);

  const gridConfig = useMemo(
    () => ({
      cols: gridCols,
      rowHeight: gridRowHeight,
      margin: [gridGap, DEFAULT_ROW_GAP] as [number, number],
      maxRows: gridRows,
    }),
    [gridCols, gridRowHeight, gridGap, gridRows]
  );

  const gridWidth = useMemo(
    () => calculateGridWidth(gridColWidth, gridCols, gridGap),
    [gridColWidth, gridCols, gridGap]
  );

  // Header/Sidebar 고정 노출 여부에 따라 그리드를 점유하는 예약 영역 +
  // 사용자 지정 금지 영역을 합친 실제(effective) 배치 불가 영역
  const effectiveForbiddenZones = useMemo(
    () => [
      ...forbiddenZones,
      ...buildReservedZones(
        gridCols,
        gridRows,
        isHeaderZoneFixed,
        isSidebarZoneFixed
      ),
    ],
    [forbiddenZones, gridCols, gridRows, isHeaderZoneFixed, isSidebarZoneFixed]
  );

  const handleDragStart = useCallback(() => {
    isGridInteractingRef.current = true;
  }, []);

  const handleDragStop = useCallback(
    (newLayout: Layout) => {
      isGridInteractingRef.current = false;

      if (newLayout.some((item) => item.i === DROPPING_WIDGET_ID)) {
        return;
      }

      const isCommitted = commitLayout(newLayout);

      if (!isCommitted) {
        remountGrid(useDashboardStore.getState().layout);
      }
    },
    [commitLayout, remountGrid]
  );

  const handleResizeStop = useCallback(
    (newLayout: Layout) => {
      isGridInteractingRef.current = false;
      const isCommitted = commitLayout(newLayout);

      if (!isCommitted) {
        remountGrid(useDashboardStore.getState().layout);
      }
    },
    [commitLayout, remountGrid]
  );

  const handleDropDragOver = useCallback(() => {
    const containerType = useDashboardStore.getState().draggingContainerType;

    if (!containerType) {
      return false;
    }

    const catalogItem = getContainerCatalogItem(containerType);

    if (!catalogItem) {
      return false;
    }

    return {
      w: catalogItem.defaultW,
      h: catalogItem.defaultH,
    };
  }, []);

  const handleDrop = useCallback(
    (newLayout: Layout, droppedItem: LayoutItem | undefined) => {
      const containerType = useDashboardStore.getState().draggingContainerType;

      isGridInteractingRef.current = false;
      setDraggingContainerType(null);

      if (!droppedItem || !containerType) {
        return;
      }

      placeContainerFromDrop(containerType, newLayout, droppedItem);
    },
    [placeContainerFromDrop, setDraggingContainerType]
  );

  const handleBackgroundClick = useCallback(() => {
    if (builderMode === 'edit') {
      setSelectedContainerId(null);
    }
  }, [builderMode, setSelectedContainerId]);

  const isInteractive = builderMode === 'edit';

  const gridChildren = useMemo(
    () =>
      visibleLayout.map((item) => {
        const entity = containers[item.i];

        if (!entity) {
          return null;
        }

        const catalogItem = getContainerCatalogItem(entity.type);
        const title = catalogItem?.label ?? entity.type;

        return (
          <div key={item.i} style={{ height: '100%' }}>
            <GridContainer
              entity={entity}
              title={title}
              isSelected={selectedContainerId === item.i}
              mode={builderMode}
              onSelect={() => {
                if (builderMode === 'edit') {
                  setSelectedContainerId(item.i);
                }
              }}
              onRemove={() => removeContainer(item.i)}
              onActivePanelChange={(panelIndex) =>
                setActivePanel(item.i, panelIndex)
              }
            />
          </div>
        );
      }),
    [
      visibleLayout,
      containers,
      selectedContainerId,
      builderMode,
      removeContainer,
      setSelectedContainerId,
      setActivePanel,
    ]
  );

  return (
    <div style={S.builderLayout}>
      <ComponentSidebar />
      <div
        ref={containerRef}
        style={S.mainArea}
        onClick={handleBackgroundClick}
        role='presentation'
      >
        <GridColsSettings />
        {mounted && (
          <div
            style={{
              ...S.gridWrapper,
              width: gridWidth,
              minWidth: gridWidth,
            }}
          >
            {isGridLinesVisible && (
              <GridBackground
                width={gridWidth}
                cols={gridCols}
                rowHeight={gridRowHeight}
                margin={[gridGap, DEFAULT_ROW_GAP]}
                rows={gridRows}
                color={GRID_LINE_COLOR}
              />
            )}
            {isForbiddenZonesVisible && (
              <ForbiddenZonesOverlay
                width={gridWidth}
                cols={gridCols}
                rowHeight={gridRowHeight}
                margin={[gridGap, DEFAULT_ROW_GAP]}
                rows={gridRows}
                zones={effectiveForbiddenZones}
              />
            )}
            <GridLayout
              key={`${gridKey}-${gridColWidth}-${gridCols}-${gridGap}`}
              width={gridWidth}
              style={{ width: gridWidth }}
              layout={visibleLayout}
              compactor={GRID_COMPACTOR}
              droppingItem={droppingItem}
              gridConfig={gridConfig}
              dragConfig={{
                ...DRAG_CONFIG,
                enabled: isInteractive,
              }}
              resizeConfig={{
                ...RESIZE_CONFIG,
                enabled: isInteractive,
              }}
              dropConfig={{
                ...DROP_CONFIG,
                enabled: isInteractive,
              }}
              onDragStart={handleDragStart}
              onDragStop={handleDragStop}
              onResizeStop={handleResizeStop}
              onDropDragOver={handleDropDragOver}
              onDrop={handleDrop}
            >
              {gridChildren}
            </GridLayout>
          </div>
        )}
      </div>
    </div>
  );
};

export default Builder;
