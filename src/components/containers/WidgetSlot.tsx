import { useEffect } from 'react';

import type { BuilderMode, ContainerWidget } from '@/types/container';
import { getWidgetCatalogItem } from '@/constants/widgetCatalog';

import * as S from './ContainerShell.style';

type WidgetSlotProps = {
  mode: BuilderMode;
  widget: ContainerWidget | null;
  emptyHint?: string;
};

/**
 * 편집 모드: container 엔티티 존재 → 빈 슬롯 UI 표시
 * 뷰 모드: container.widget 존재 시에만 위젯 렌더 (없으면 비움)
 */
const WidgetSlot = ({ mode, widget, emptyHint }: WidgetSlotProps) => {
  useEffect(() => {
    if (!widget) {
      return;
    }

    console.debug(`[WidgetSlot] mount ${widget.catalogId} (${widget.id})`);

    return () => {
      console.debug(`[WidgetSlot] unmount ${widget.catalogId} (${widget.id})`);
    };
  }, [widget]);

  if (!widget) {
    if (mode === 'view') {
      return null;
    }

    return (
      <div style={S.emptySlot('edit')}>
        <div>빈 컨테이너</div>
        <div>{emptyHint ?? '사이드바에서 사이즈가 맞는 위젯을 선택하세요'}</div>
      </div>
    );
  }

  const catalogItem = getWidgetCatalogItem(widget.catalogId);
  const title = catalogItem?.label ?? widget.catalogId;
  const { type, dataKey, dataType, values } = widget.data;

  return (
    <div style={S.widgetCard}>
      <div style={S.widgetTitle}>{title} 위젯</div>
      <div style={S.widgetMeta}>
        {type ? (
          <>
            data: {type}
            {dataKey ? ` → ${dataKey}` : ''}
            {dataType ? ` → ${dataType}` : ''}
          </>
        ) : (
          'data 미설정'
        )}
      </div>
      {Object.keys(values).length > 0 && (
        <div style={S.widgetMeta}>
          {Object.entries(values)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ')}
        </div>
      )}
    </div>
  );
};

export default WidgetSlot;
