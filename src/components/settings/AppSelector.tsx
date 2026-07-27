import { useCallback } from 'react';

import { ALL_APP_BREAKPOINTS } from '@/responsive/tokens/breakpoints';
import type { AppId } from '@/responsive/tokens/breakpoints';
import { useDashboardStore } from '@/store/useDashboardStore';

import * as S from './GridColsSettings.style';
import * as A from './AppSelector.style';

/**
 * 빌더에서 편집 대상 "앱(디바이스 프로필)"을 선택하는 컨트롤.
 *
 * 앱을 전환하면 store의 layout/containers/grid 설정이 해당 앱 전용
 * 슬롯으로 교체된다(useDashboardStore.setActiveAppId). 각 앱은 이미지
 * 스펙(Cell/Margin/Gutter/Col/Row)에 맞춰 그리드가 초기화되므로, 여기
 * 아래에 현재 선택된 앱의 스펙을 참고용으로 함께 보여준다.
 *
 * DID는 뷰포트 폭 구간이 아니라 항상 1080x1920 고정 캔버스이므로
 * bp-min/bp-max 표시는 생략한다.
 */
const AppSelector = () => {
  const activeAppId = useDashboardStore((state) => state.activeAppId);
  const setActiveAppId = useDashboardStore((state) => state.setActiveAppId);

  const activeBreakpoint =
    ALL_APP_BREAKPOINTS.find((bp) => bp.id === activeAppId) ??
    ALL_APP_BREAKPOINTS[0];

  const handleClickApp = useCallback(
    (appId: AppId) => {
      setActiveAppId(appId);
    },
    [setActiveAppId]
  );

  return (
    <div style={S.settingSection}>
      <span style={S.label}>앱</span>
      <div style={A.wrapper}>
        <div style={A.appButtonGroup}>
          {ALL_APP_BREAKPOINTS.map((bp) => (
            <button
              key={bp.id}
              type='button'
              style={A.appButton(bp.id === activeAppId)}
              onClick={() => handleClickApp(bp.id)}
              title={
                bp.id === 'did'
                  ? `${bp.label} · ${bp.baseWidthPx}×${bp.baseHeightPx}px 고정`
                  : `${bp.label} · ${bp.bpMinPx}~${bp.bpMaxPx}px`
              }
            >
              {bp.label}
            </button>
          ))}
        </div>
        <span style={A.specLine}>
          Cell {activeBreakpoint.cellWidthPx}×{activeBreakpoint.cellHeightPx}
          · Gutter {activeBreakpoint.gutterPx} · Margin{' '}
          {activeBreakpoint.marginBlockPx}/{activeBreakpoint.marginInlinePx} ·
          Col×Row {activeBreakpoint.col}×{activeBreakpoint.row}
        </span>
      </div>
    </div>
  );
};

export default AppSelector;
