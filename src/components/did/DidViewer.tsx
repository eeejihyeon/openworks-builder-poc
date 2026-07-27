import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDashboardStore } from '@/store/useDashboardStore';
import { getContainerCatalogItem } from '@/constants/containerCatalog';
import GridContainer from '@/components/containers/GridContainer';
import { DID_BREAKPOINT } from '@/responsive/tokens/breakpoints';
import { computeCellSpanPx } from '@/responsive/utils/gridMath';

import * as S from './DidViewer.style';

const noop = () => {};

const readWindowSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

/**
 * "DID(Digital Information Display)" 전용 라우트.
 *
 * 일반 뷰어(Viewer.tsx)는 vw+clamp() 로 root font-size 자체가 뷰포트에
 * 맞춰 유동적으로 바뀌지만, DID는 정반대다 — 요구사항("실제 디바이스
 * 물리 해상도와 무관하게 지정 라우트에서 1080x1920 고정 사이즈 강제")에
 * 따라 내부 레이아웃은 항상 1080x1920 px 캔버스 그대로 고정하고,
 * 화면 크기에 맞추는 확대/축소는 오직 `transform: scale()` 로만
 * 처리한다(레터박스 방식). 그래서 브레이크포인트 재계산이나 rem 변환이
 * 전혀 없고, 어떤 디바이스에서 열어도 항상 동일한 1080x1920 레이아웃이
 * 나온다.
 */
const DidViewer = () => {
  const setCurrentPage = useDashboardStore((state) => state.setCurrentPage);
  const getAppSummary = useDashboardStore((state) => state.getAppSummary);

  // 뷰어와 동일하게, 활성 앱이 DID가 아니어도(예: 빌더에서 다른 앱을 보는
  // 동안 DID를 새 탭으로 열어둔 경우) 배치가 바뀌면 리렌더되도록 구독만
  // 해두고 실제 조회는 getAppSummary로 위임한다.
  const activeAppId = useDashboardStore((state) => state.activeAppId);
  const layout = useDashboardStore((state) => state.layout);
  const containers = useDashboardStore((state) => state.containers);
  const appSlices = useDashboardStore((state) => state.appSlices);

  const [windowSize, setWindowSize] = useState(readWindowSize);

  useEffect(() => {
    const handleResize = () => setWindowSize(readWindowSize());

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const summary = useMemo(
    () => getAppSummary(DID_BREAKPOINT.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeAppId, layout, containers, appSlices, getAppSummary]
  );

  const handleBack = useCallback(() => setCurrentPage('builder'), [setCurrentPage]);

  // 실제 창(물리 해상도)이 얼마든 상관없이 1080x1920 비율을 유지한 채
  // 화면 안에 완전히 들어오도록 축소/확대 비율만 계산한다.
  const scale = Math.min(
    windowSize.width / DID_BREAKPOINT.baseWidthPx,
    windowSize.height / DID_BREAKPOINT.baseHeightPx
  );

  const hasContent = summary.layout.length > 0;

  return (
    <div style={S.page}>
      <button type='button' style={S.backButton} onClick={handleBack}>
        ← 편집으로 돌아가기
      </button>
      <div style={S.badge}>
        <span style={S.badgeStrong}>DID</span>
        <span>
          {DID_BREAKPOINT.baseWidthPx}×{DID_BREAKPOINT.baseHeightPx}px 고정
        </span>
        <span>
          실제 창 {windowSize.width}×{windowSize.height}px
        </span>
        <span>scale {scale.toFixed(3)}</span>
      </div>

      <div style={S.letterboxArea}>
        <div
          style={{
            ...S.canvas,
            width: `${DID_BREAKPOINT.baseWidthPx}px`,
            height: `${DID_BREAKPOINT.baseHeightPx}px`,
            paddingBlock: `${DID_BREAKPOINT.marginBlockPx}px`,
            paddingInline: `${DID_BREAKPOINT.marginInlinePx}px`,
            transform: `scale(${scale})`,
          }}
        >
          {hasContent ? (
            summary.layout.map((item) => {
              const entity = summary.containers[item.i];

              if (!entity) {
                return null;
              }

              const rect = computeCellSpanPx(
                DID_BREAKPOINT,
                item.x,
                item.y,
                item.w,
                item.h
              );
              const catalogItem = getContainerCatalogItem(entity.type);

              return (
                <div
                  key={item.i}
                  style={{
                    position: 'absolute',
                    left: `${rect.leftPx}px`,
                    top: `${rect.topPx}px`,
                    width: `${rect.widthPx}px`,
                    height: `${rect.heightPx}px`,
                    boxSizing: 'border-box',
                  }}
                >
                  <GridContainer
                    entity={entity}
                    title={catalogItem?.label ?? entity.type}
                    isSelected={false}
                    mode='view'
                    onSelect={noop}
                    onRemove={noop}
                    onActivePanelChange={noop}
                  />
                </div>
              );
            })
          ) : (
            <div style={S.emptyState}>
              <span style={S.emptyStateTitle}>
                DID 화면에 대한 배치가 아직 없습니다
              </span>
              <span>
                편집으로 돌아가 상단 "앱" 선택기에서 DID를 선택한 뒤
                컨테이너를 배치해보세요.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DidViewer;
