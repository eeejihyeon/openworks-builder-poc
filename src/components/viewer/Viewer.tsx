import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDashboardStore } from '@/store/useDashboardStore';
import type { ContainerEntity } from '@/types/container';
import { getContainerCatalogItem } from '@/constants/containerCatalog';
import GridContainer from '@/components/containers/GridContainer';
import { useViewportBreakpoint } from '@/responsive/hooks/useViewportBreakpoint';
import {
  installResponsiveStylesheet,
  setResponsiveAspectLocked,
} from '@/responsive/styles/installResponsiveStylesheet';
import {
  computeCellSpanRect,
  gridContentSizeRem,
} from '@/responsive/utils/gridMath';

import * as S from './Viewer.style';

const noop = () => {};

// 뷰(어) 모드 공통 규칙: container.widget이 하나도 없으면 빈 컨테이너는 숨긴다.
const hasAnyWidget = (entity: ContainerEntity) =>
  entity.panels.some((panel) => panel.widget != null);

/**
 * "뷰어 모드" — 설정 툴바 없는 편집 불가 화면.
 *
 * 실제 브라우저 창 크기(useViewportBreakpoint, resize/orientationchange에
 * 실시간 반응)에 매칭되는 브레이크포인트를 찾아, 그 앱(Mobile/Tablet
 * Portrait/Tablet Landscape/Desktop)에 대해 빌더에서 배치해둔
 * 컨테이너/위젯을 이미지 스펙 그대로의 Cell/Gutter/Margin 기반 rem 그리드
 * 위에 렌더링한다.
 *
 * - 브레이크포인트 "경계"를 넘어가면(예: 799px -> 800px) 표시되는 앱 자체가
 *   Mobile -> Tablet Portrait로 스냅 전환된다.
 * - 하나의 브레이크포인트 "구간 내부"에서 리사이징하면 html.rs-root 의
 *   vw+clamp() font-size 가 유동적으로 바뀌고, 모든 셀/컨테이너는 rem
 *   단위라 함께 비례 스케일되므로 겹침/잘림 없이 항상 동일한 상대 배치를
 *   유지한다.
 * - 비율 고정 ON이면 셀 높이를 cellWidth×2/3(3:2)로 산출하고, OFF면
 *   토큰의 cellHeightPx→rem을 그대로 쓴다.
 */
const Viewer = () => {
  const setCurrentPage = useDashboardStore((state) => state.setCurrentPage);
  const getAppSummary = useDashboardStore((state) => state.getAppSummary);
  const isCellAspectRatioLocked = useDashboardStore(
    (state) => state.isCellAspectRatioLocked
  );

  // 아래 4개는 실제 값을 쓰지 않더라도 "구독"만으로 활성 앱의 데이터가
  // 바뀔 때(예: 뷰어를 열어둔 채 다른 탭에서 빌더를 편집) 리렌더를
  // 유발하기 위해 구독한다. 실제 조회는 getAppSummary()로 위임한다.
  const activeAppId = useDashboardStore((state) => state.activeAppId);
  const layout = useDashboardStore((state) => state.layout);
  const containers = useDashboardStore((state) => state.containers);
  const appSlices = useDashboardStore((state) => state.appSlices);

  const { breakpoint, viewportWidthPx, viewportHeightPx } =
    useViewportBreakpoint();

  const [activePanelOverrides, setActivePanelOverrides] = useState<
    Record<string, number>
  >({});
  // 앱이 바뀌면(브레이크포인트 스냅) 이전 화면에서 남아있던 탭/슬라이더
  // 선택 상태를 초기화한다. (렌더 중 상태 조정 패턴 — effect 대신 사용해
  // 불필요한 추가 커밋/깜빡임 없이 같은 렌더에서 바로 반영한다.)
  const [renderedBreakpointId, setRenderedBreakpointId] = useState(
    breakpoint.id
  );

  if (breakpoint.id !== renderedBreakpointId) {
    setRenderedBreakpointId(breakpoint.id);
    setActivePanelOverrides({});
  }

  useEffect(() => installResponsiveStylesheet(), []);

  useEffect(() => {
    setResponsiveAspectLocked(isCellAspectRatioLocked);
  }, [isCellAspectRatioLocked]);

  const summary = useMemo(
    () => getAppSummary(breakpoint.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [breakpoint.id, activeAppId, layout, containers, appSlices, getAppSummary]
  );

  const handleBack = useCallback(() => setCurrentPage('builder'), [setCurrentPage]);

  const handleActivePanelChange = useCallback(
    (containerId: string, panelIndex: number) => {
      setActivePanelOverrides((prev) => ({ ...prev, [containerId]: panelIndex }));
    },
    []
  );

  const { widthRem, heightRem } = gridContentSizeRem(
    breakpoint,
    isCellAspectRatioLocked
  );

  // 뷰 모드(Builder 내 미리보기)와 동일하게, 위젯이 배치되지 않은 빈
  // 컨테이너는 뷰어 모드에서도 렌더링하지 않는다.
  const visibleLayout = useMemo(
    () =>
      summary.layout.filter((item) => {
        const entity = summary.containers[item.i];

        return Boolean(entity) && hasAnyWidget(entity);
      }),
    [summary]
  );

  const hasContent = summary.layout.length > 0;

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button type='button' style={S.backButton} onClick={handleBack}>
          ← 편집으로 돌아가기
        </button>
        <div style={S.badge}>
          <span style={S.badgeStrong}>{breakpoint.label}</span>
          <span>
            {viewportWidthPx}×{viewportHeightPx}px
          </span>
          <span>
            Col×Row {summary.gridCols}×{summary.gridRows}
          </span>
        </div>
      </div>

      <div className='rs-stage' style={S.stage}>
        {hasContent ? (
          <div
            className='rs-grid-surface'
            style={{
              ...S.gridSurfaceWrapper,
              width: `${widthRem}rem`,
              height: `${heightRem}rem`,
            }}
          >
            {visibleLayout.map((item) => {
              const entity = summary.containers[item.i];

              if (!entity) {
                return null;
              }

              const rect = computeCellSpanRect(
                breakpoint,
                item.x,
                item.y,
                item.w,
                item.h,
                isCellAspectRatioLocked
              );
              const catalogItem = getContainerCatalogItem(entity.type);
              const overriddenIndex = activePanelOverrides[item.i];
              const renderedEntity =
                overriddenIndex != null
                  ? { ...entity, activePanelIndex: overriddenIndex }
                  : entity;

              return (
                <div
                  key={item.i}
                  className='rs-item'
                  style={{
                    left: `${rect.leftRem}rem`,
                    top: `${rect.topRem}rem`,
                    width: `${rect.widthRem}rem`,
                    height: `${rect.heightRem}rem`,
                  }}
                >
                  <GridContainer
                    entity={renderedEntity}
                    title={catalogItem?.label ?? entity.type}
                    isSelected={false}
                    mode='view'
                    onSelect={noop}
                    onRemove={noop}
                    onActivePanelChange={(panelIndex) =>
                      handleActivePanelChange(item.i, panelIndex)
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div style={S.emptyState}>
            <span style={S.emptyStateTitle}>
              {breakpoint.label} 화면에 대한 배치가 아직 없습니다
            </span>
            <span>
              편집으로 돌아가 상단 "앱" 선택기에서 {breakpoint.label}을 선택한
              뒤 컨테이너를 배치해보세요.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewer;
