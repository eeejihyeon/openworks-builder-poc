import { useCallback, useRef } from 'react';

import { WIDGET_DRAG_MIME_TYPE } from '@/constants/gridDrop';
import { WIDGET_CATALOG } from '@/constants/widgetCatalog';
import { useDashboardStore } from '@/store/useDashboardStore';

import * as S from './ComponentSidebar.style';

const ComponentSidebar = () => {
  const addWidget = useDashboardStore((state) => state.addWidget);
  const setDraggingWidgetType = useDashboardStore(
    (state) => state.setDraggingWidgetType
  );
  const draggingWidgetType = useDashboardStore(
    (state) => state.draggingWidgetType
  );

  const isDraggedRef = useRef(false);

  const handleClickAddWidget = useCallback(
    (widgetType: string) => {
      if (isDraggedRef.current) {
        return;
      }

      addWidget(widgetType);
    },
    [addWidget]
  );

  const handleDragStartWidget = useCallback(
    (widgetType: string, event: React.DragEvent<HTMLButtonElement>) => {
      isDraggedRef.current = true;
      setDraggingWidgetType(widgetType);
      event.dataTransfer.setData(WIDGET_DRAG_MIME_TYPE, widgetType);
      event.dataTransfer.setData('text/plain', widgetType);
      event.dataTransfer.effectAllowed = 'copy';
    },
    [setDraggingWidgetType]
  );

  const handleDragEndWidget = useCallback(() => {
    setDraggingWidgetType(null);

    window.setTimeout(() => {
      isDraggedRef.current = false;
    }, 0);
  }, [setDraggingWidgetType]);

  return (
    <aside style={S.sidebar}>
      <div style={S.header}>
        <h2 style={S.title}>컴포넌트</h2>
        <p style={S.description}>클릭/그리드 드래그로 위젯 추가</p>
      </div>
      <div style={S.list}>
        {WIDGET_CATALOG.map((item) => (
          <button
            key={item.id}
            type='button'
            draggable
            style={S.itemButton(draggingWidgetType === item.id)}
            onClick={() => handleClickAddWidget(item.id)}
            onDragStart={(event) => handleDragStartWidget(item.id, event)}
            onDragEnd={handleDragEndWidget}
          >
            <span style={S.itemLabel}>{item.label}</span>
            <span style={S.itemDescription}>{item.description}</span>
            <span style={S.itemMeta}>
              {item.defaultW} × {item.defaultH} 칸
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default ComponentSidebar;
