/**
 * 반응형 브레이크포인트 단일 소스(Single Source of Truth).
 *
 * 이미지 스펙(2. Breakpoint 및 스펙 표)의 값을 그대로 옮긴 토큰 테이블이다.
 * - bp-min / bp-max / fs-min / fs-max 를 브레이크포인트별로 교체 가능한
 *   구조로 유지한다 (요구사항: 재사용 가능한 구조).
 * - Cell / Margin(상하·좌우) / Gutter / Col / Row 값은 "기준 해상도" 기준
 *   px 값을 그대로 보관하고, 실제 CSS/계산에는 rem 파생값을 사용한다.
 *
 * 이 파일의 값만 바꾸면 styles/generateResponsiveCss.ts 가 생성하는
 * CSS(@media 스냅 구간 + clamp 유동 스케일 공식)와 utils/gridMath.ts 가
 * 계산하는 rem/px 값이 함께 갱신된다.
 */

export type BreakpointOrientation = 'portrait' | 'landscape' | 'any';

/** 빌더에서 "앱(디바이스 프로필)"을 선택하는 단위. 브레이크포인트 id와 1:1 대응.
 * 'did'는 뷰포트 폭에 따라 유동/스냅되는 일반 브레이크포인트가 아니라,
 * 물리 해상도와 무관하게 항상 1080x1920 고정 캔버스로 렌더링되는 별도
 * 라우트(DidViewer)용 프로필이다. */
export type AppId =
  | 'mobile'
  | 'tablet-portrait'
  | 'tablet-landscape'
  | 'desktop'
  | 'did';

export interface BreakpointToken {
  /** 브레이크포인트 식별자. CSS 클래스/데이터 속성 스냅 전환에 사용. */
  id: AppId;
  label: string;
  /** 뷰포트 구간 (px). 이 구간 안에서만 유동 스케일링이 적용된다. */
  bpMinPx: number;
  bpMaxPx: number;
  /** 디자인 시안 기준 해상도 (px). 이 지점에서 root font-size == fsBasePx. */
  baseWidthPx: number;
  baseHeightPx: number;
  /** 기준 해상도에서의 root font-size(px). 모든 구간에서 16으로 고정해
   * Cell(48x32px) 같은 디자인 px 값이 구간에 상관없이 동일한 rem 값으로
   * 파생되도록 한다. */
  fsBasePx: number;
  cellWidthPx: number;
  cellHeightPx: number;
  /** 상하 마진 (px) */
  marginBlockPx: number;
  /** 좌우 마진 (px) */
  marginInlinePx: number;
  gutterPx: number;
  col: number;
  row: number;
  orientation: BreakpointOrientation;
}

/** 1rem == 16px 로 고정한다 (요구사항: html 루트 단일 지점 vw+clamp, 하위는 rem 파생). */
export const REM_BASE_PX = 16;

/** 1920px를 초과하는(>=1921px) 구간에서 root font-size를 16px로 고정하기
 * 위해 데스크톱 구간을 기준값으로 재사용한다. */
export const WIDE_VIEWPORT_MIN_PX = 1921;
export const WIDE_ROOT_FONT_SIZE_PX = 16;

export const BREAKPOINTS: BreakpointToken[] = [
  {
    id: 'mobile',
    label: 'Mobile',
    bpMinPx: 0,
    bpMaxPx: 799,
    baseWidthPx: 360,
    baseHeightPx: 800,
    fsBasePx: 16,
    cellWidthPx: 48,
    cellHeightPx: 32,
    marginBlockPx: 4,
    marginInlinePx: 16,
    gutterPx: 8,
    col: 6,
    row: 20,
    orientation: 'portrait',
  },
  {
    id: 'tablet-portrait',
    label: 'Tablet Portrait',
    bpMinPx: 800,
    bpMaxPx: 1279,
    baseWidthPx: 800,
    baseHeightPx: 1280,
    fsBasePx: 16,
    cellWidthPx: 48,
    cellHeightPx: 32,
    marginBlockPx: 24,
    marginInlinePx: 24,
    gutterPx: 16,
    col: 12,
    row: 26,
    orientation: 'portrait',
  },
  {
    id: 'tablet-landscape',
    label: 'Tablet Landscape',
    bpMinPx: 1280,
    bpMaxPx: 1599,
    baseWidthPx: 1280,
    baseHeightPx: 800,
    fsBasePx: 16,
    cellWidthPx: 48,
    cellHeightPx: 32,
    marginBlockPx: 24,
    marginInlinePx: 8,
    gutterPx: 16,
    col: 20,
    row: 16,
    orientation: 'landscape',
  },
  {
    id: 'desktop',
    label: 'Desktop',
    bpMinPx: 1600,
    bpMaxPx: 1920,
    baseWidthPx: 1920,
    baseHeightPx: 1080,
    fsBasePx: 16,
    cellWidthPx: 48,
    cellHeightPx: 32,
    marginBlockPx: 20,
    marginInlinePx: 8,
    gutterPx: 16,
    col: 30,
    row: 22,
    orientation: 'landscape',
  },
];

export const MOBILE_BREAKPOINT = BREAKPOINTS[0];
export const TABLET_PORTRAIT_BREAKPOINT = BREAKPOINTS[1];
export const TABLET_LANDSCAPE_BREAKPOINT = BREAKPOINTS[2];
export const DESKTOP_BREAKPOINT = BREAKPOINTS[3];

/** 태블릿 Portrait <-> Landscape 전환 시 서로 짝이 되는 브레이크포인트. */
export const TABLET_BREAKPOINT_IDS = new Set([
  TABLET_PORTRAIT_BREAKPOINT.id,
  TABLET_LANDSCAPE_BREAKPOINT.id,
]);

/**
 * DID(Digital Information Display) 전용 고정 캔버스 스펙.
 *
 * 요구사항: "실제 디바이스 물리 해상도와 무관하게 지정 라우트에서
 * 1080x1920 고정 사이즈 강제". 다른 브레이크포인트처럼 뷰포트 폭 구간에
 * 매칭시키는 게 아니라(bpMin/bpMax는 사용하지 않음), 항상 이 토큰 하나만
 * 사용해 1080x1920 px 캔버스를 그대로 그린 뒤 `transform: scale()`로
 * 화면 크기에 맞춰 축소/확대(레터박스)한다. 그래서 `matchBreakpoint()`가
 * 순회하는 `BREAKPOINTS` 배열에는 포함하지 않는다.
 *
 * Cell 48x32 / Gutter 16 을 그대로 유지한 채 Margin·Col·Row 만 역산해
 * base 해상도 1080x1920과 픽셀 단위로 정확히 맞아떨어지도록 했다.
 * - 가로: col(16)*48 + (16-1)*16 + marginInline(36)*2 = 768+240+72 = 1080
 * - 세로: row(39)*32 + (39-1)*16 + marginBlock(32)*2 = 1248+608+64 = 1920
 */
export const DID_BREAKPOINT: BreakpointToken = {
  id: 'did',
  label: 'DID',
  bpMinPx: 0,
  bpMaxPx: 0,
  baseWidthPx: 1080,
  baseHeightPx: 1920,
  fsBasePx: 16,
  cellWidthPx: 48,
  cellHeightPx: 32,
  marginBlockPx: 32,
  marginInlinePx: 36,
  gutterPx: 16,
  col: 16,
  row: 39,
  orientation: 'portrait',
};

/** 앱 선택기 등 "id로 토큰을 조회"해야 하는 곳에서 사용하는, DID까지
 * 포함한 전체 앱 프로필 목록. 뷰포트 폭 기반 스냅 매칭(matchBreakpoint)은
 * 계속 `BREAKPOINTS`만 사용한다. */
export const ALL_APP_BREAKPOINTS: BreakpointToken[] = [
  ...BREAKPOINTS,
  DID_BREAKPOINT,
];

export const findBreakpointById = (
  id: string
): BreakpointToken | undefined =>
  ALL_APP_BREAKPOINTS.find((bp) => bp.id === id);

/** 주어진 뷰포트 너비(px)가 속하는 브레이크포인트를 찾는다.
 * 1921px 이상은 데스크톱 구간의 상한 고정 값(16px)을 그대로 재사용한다. */
export const matchBreakpoint = (viewportWidthPx: number): BreakpointToken => {
  if (viewportWidthPx >= WIDE_VIEWPORT_MIN_PX) {
    return DESKTOP_BREAKPOINT;
  }

  const matched = BREAKPOINTS.find(
    (bp) => viewportWidthPx >= bp.bpMinPx && viewportWidthPx <= bp.bpMaxPx
  );

  return matched ?? BREAKPOINTS[BREAKPOINTS.length - 1];
};

/** 뷰포트가 1921px 이상인지 여부 (root font-size 16px 고정 + 초과 여백 margin 처리 구간). */
export const isWideFixedViewport = (viewportWidthPx: number): boolean =>
  viewportWidthPx >= WIDE_VIEWPORT_MIN_PX;
