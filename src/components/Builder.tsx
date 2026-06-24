import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { GridBackground } from 'react-grid-layout/extras';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { pushWithoutCompactCompactor } from '@/constants/gridCompactor';
import { DROPPING_WIDGET_ID } from '@/constants/gridDrop';
import { DEFAULT_ROW_GAP } from '@/constants/gridGap';
import { getWidgetCatalogItem } from '@/constants/widgetCatalog';
import useLayoutHistoryShortcuts from '@/hooks/useLayoutHistoryShortcuts';
import { useDashboardStore } from '@/store/useDashboardStore';
import { resolveWidgetType } from '@/utils/buildWidgetInstanceId';
import { calculateGridWidth } from '@/utils/calculateGridWidth';
import { cloneLayout, isSameLayout } from '@/utils/layoutHistory';

import GridColsSettings from './settings/GridColsSettings';
import ComponentSidebar from './sidebar/ComponentSidebar';
import ForbiddenZonesOverlay from './grid/ForbiddenZonesOverlay';
import Widget from './widgets/Widget';

import * as S from './Builder.style';

const DRAG_CONFIG = { enabled: true, handle: '.widget-drag-handle' };
const RESIZE_CONFIG = { enabled: true };
const DROP_CONFIG = { enabled: true };
const GRID_COMPACTOR = pushWithoutCompactCompactor;
const MIN_GRID_ROWS = 10;
const GRID_LINE_COLOR = '#e2e8f0';

const buildInitialLayout = () =>
  cloneLayout(useDashboardStore.getState().layout);

const Builder = () => {
  const gridCols = useDashboardStore((state) => state.gridCols);
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
  const commitLayout = useDashboardStore((state) => state.commitLayout);
  const placeWidgetFromDrop = useDashboardStore(
    (state) => state.placeWidgetFromDrop
  );
  const removeWidget = useDashboardStore((state) => state.removeWidget);
  const setDraggingWidgetType = useDashboardStore(
    (state) => state.setDraggingWidgetType
  );
  const draggingWidgetType = useDashboardStore(
    (state) => state.draggingWidgetType
  );

  const [mountedLayout, setMountedLayout] = useState(buildInitialLayout);
  const [gridKey, setGridKey] = useState(0);
  const isGridInteractingRef = useRef(false);

  useLayoutHistoryShortcuts();
  const { containerRef, width, mounted } = useContainerWidth();

  const remountGrid = useCallback((layout: Layout) => {
    setMountedLayout(cloneLayout(layout));
    setGridKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!draggingWidgetType) {
      isGridInteractingRef.current = false;
    }
  }, [draggingWidgetType]);

  useEffect(
    () =>
      useDashboardStore.subscribe((state, previousState) => {
        if (isGridInteractingRef.current || state.draggingWidgetType) {
          return;
        }

        if (isSameLayout(state.layout, previousState.layout)) {
          return;
        }

        remountGrid(state.layout);
      }),
    [remountGrid]
  );

  const droppingItem = useMemo<LayoutItem>(
    () => ({
      i: DROPPING_WIDGET_ID,
      x: 0,
      y: 0,
      w: 3,
      h: 4,
    }),
    []
  );

  const gridConfig = useMemo(
    () => ({
      cols: gridCols,
      rowHeight: gridRowHeight,
      margin: [gridGap, DEFAULT_ROW_GAP] as [number, number],
    }),
    [gridCols, gridRowHeight, gridGap]
  );

  const gridWidth = useMemo(
    () => Math.min(width, calculateGridWidth(gridColWidth, gridCols, gridGap)),
    [width, gridColWidth, gridCols, gridGap]
  );

  const gridRows = useMemo(() => {
    const maxRowFromLayout = mountedLayout.reduce(
      (max, item) => Math.max(max, item.y + item.h),
      0
    );
    const maxRowFromZones = forbiddenZones.reduce(
      (max, zone) => Math.max(max, zone.y + zone.h),
      0
    );

    return Math.max(maxRowFromLayout, maxRowFromZones, MIN_GRID_ROWS);
  }, [forbiddenZones, mountedLayout]);

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
    const widgetType = useDashboardStore.getState().draggingWidgetType;

    if (!widgetType) {
      return false;
    }

    const catalogItem = getWidgetCatalogItem(widgetType);

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
      const widgetType = useDashboardStore.getState().draggingWidgetType;

      isGridInteractingRef.current = false;
      setDraggingWidgetType(null);

      if (!droppedItem || !widgetType) {
        return;
      }

      placeWidgetFromDrop(widgetType, newLayout, droppedItem);
    },
    [placeWidgetFromDrop, setDraggingWidgetType]
  );

  const gridChildren = useMemo(
    () =>
      mountedLayout.map((item) => {
        const widgetType = resolveWidgetType(item.i);
        const catalogItem = getWidgetCatalogItem(widgetType);
        const title = catalogItem?.label ?? item.i;

        return (
          <div key={item.i} style={{ height: '100%' }}>
            <Widget title={title} onClickRemove={() => removeWidget(item.i)} />
          </div>
        );
      }),
    [mountedLayout, removeWidget]
  );

  return (
    <div style={S.builderLayout}>
      <ComponentSidebar />
      <div ref={containerRef} style={S.mainArea}>
        <GridColsSettings />
        {mounted && (
          <div style={{ ...S.gridWrapper, width: gridWidth }}>
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
            {/* {isForbiddenZonesVisible && (
              <ForbiddenZonesOverlay
                width={gridWidth}
                cols={gridCols}
                rowHeight={gridRowHeight}
                margin={[gridGap, DEFAULT_ROW_GAP]}
                rows={gridRows}
                zones={forbiddenZones}
              />
            )} */}
            <GridLayout
              key={gridKey}
              width={gridWidth}
              layout={mountedLayout}
              compactor={GRID_COMPACTOR}
              droppingItem={droppingItem}
              gridConfig={gridConfig}
              dragConfig={DRAG_CONFIG}
              resizeConfig={RESIZE_CONFIG}
              dropConfig={DROP_CONFIG}
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
