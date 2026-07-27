import { useEffect, useState } from 'react';

import {
  matchBreakpoint,
  type BreakpointToken,
} from '@/responsive/tokens/breakpoints';
import { computeFluidRootFontSizePx } from '@/responsive/utils/gridMath';
import { getOrientation, type Orientation } from '@/responsive/utils/orientation';

export interface ViewportBreakpointState {
  breakpoint: BreakpointToken;
  viewportWidthPx: number;
  viewportHeightPx: number;
  orientation: Orientation;
  rootFontSizePx: number;
}

const readViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const buildState = (
  lockedBreakpoint: BreakpointToken | null
): ViewportBreakpointState => {
  const { width, height } = readViewport();
  const breakpoint = lockedBreakpoint ?? matchBreakpoint(width);

  return {
    breakpoint,
    viewportWidthPx: width,
    viewportHeightPx: height,
    orientation: getOrientation(width, height),
    rootFontSizePx: computeFluidRootFontSizePx(breakpoint, width),
  };
};

export interface UseViewportBreakpointOptions {
  /**
   * false 이면 마운트 시점에 매칭된 브레이크포인트를 그대로 고정한다.
   * "태블릿·모바일 CCTV를 제외한 일반 대시보드는 가로/세로 전환 시
   * 레이아웃 재계산 없이 스크롤 처리로 대응" 요구사항을 위한 옵션이다.
   * (기본값: true = 실시간 재계산)
   */
  recalculateOnResize?: boolean;
}

/**
 * 현재 뷰포트에 매칭되는 브레이크포인트/방향/root font-size 를 React에서
 * 읽기 위한 훅. 실제 화면의 시각적 스케일링(clamp/vw)은 순수 CSS가
 * 담당하므로, 이 훅은 오직 "구조적으로" 열/행 개수 등을 결정해야 하는
 * React 렌더링 로직을 위해서만 존재한다.
 */
export const useViewportBreakpoint = (
  options: UseViewportBreakpointOptions = {}
): ViewportBreakpointState => {
  const { recalculateOnResize = true } = options;

  // 잠금 모드일 때만 마운트 시점의 브레이크포인트를 한 번 계산해 state로
  // 고정한다(리렌더에도 값이 바뀌지 않음). ref 대신 state를 사용해 렌더
  // 중 ref 접근 규칙 위반을 피한다.
  const [lockedBreakpoint] = useState<BreakpointToken | null>(() =>
    recalculateOnResize ? null : matchBreakpoint(window.innerWidth)
  );

  const [state, setState] = useState<ViewportBreakpointState>(() =>
    buildState(lockedBreakpoint)
  );

  useEffect(() => {
    let frame = 0;

    const handleChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // 잠금 모드(recalculateOnResize=false)에서도 뷰포트 수치/방향
        // 표시는 최신 상태로 갱신하되, 그리드 구조 기준이 되는
        // 브레이크포인트 자체는 최초 매칭 값으로 고정한다. 이렇게 하면
        // "레이아웃(열/행) 재계산 없이 스크롤로만 대응"을 그대로
        // 재현하면서도 화면에는 실제 뷰포트 값을 보여줄 수 있다.
        setState(buildState(lockedBreakpoint));
      });
    };

    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
    };
  }, [lockedBreakpoint]);

  return state;
};
