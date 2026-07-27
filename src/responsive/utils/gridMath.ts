/**
 * 셀/거터 기반 그리드 계산 유틸.
 *
 * "구간 내부 유동 스케일링"(computeFluidRootFontSizePx)과
 * "N×M 칸 점유 시 거터 포함 폭/높이 계산"(spanWidthRem/spanHeightRem)을
 * 각각 독립된 순수 함수로 분리해, 브레이크포인트 경계 스냅 전환 로직
 * (hooks/useViewportBreakpoint.ts) 과 코드 상으로 완전히 분리되게 한다.
 */

import { REM_BASE_PX, type BreakpointToken } from '@/responsive/tokens/breakpoints';

/** 셀 비율 고정 시 사용하는 width:height (48:32 = 3:2). */
export const CELL_ASPECT_RATIO_W = 3;
export const CELL_ASPECT_RATIO_H = 2;

export const pxToRem = (px: number, remBasePx: number = REM_BASE_PX): number =>
  px / remBasePx;

export const remToPx = (rem: number, rootFontSizePx: number): number =>
  rem * rootFontSizePx;

export const cellWidthRem = (bp: BreakpointToken): number =>
  pxToRem(bp.cellWidthPx);

export const cellHeightRem = (bp: BreakpointToken): number =>
  pxToRem(bp.cellHeightPx);

/** 너비 기준 3:2 비율 높이. */
export const heightFromAspectWidth = (width: number): number =>
  (width * CELL_ASPECT_RATIO_H) / CELL_ASPECT_RATIO_W;

export const effectiveCellHeightPx = (
  bp: BreakpointToken,
  aspectLocked = false
): number =>
  aspectLocked ? heightFromAspectWidth(bp.cellWidthPx) : bp.cellHeightPx;

export const effectiveCellHeightRem = (
  bp: BreakpointToken,
  aspectLocked = false
): number => pxToRem(effectiveCellHeightPx(bp, aspectLocked));

export const gutterRem = (bp: BreakpointToken): number => pxToRem(bp.gutterPx);

export const marginBlockRem = (bp: BreakpointToken): number =>
  pxToRem(bp.marginBlockPx);

export const marginInlineRem = (bp: BreakpointToken): number =>
  pxToRem(bp.marginInlinePx);

/**
 * N칸을 점유하는 폭(rem)을 셀 사이 거터까지 포함해 계산한다.
 * width(N) = N * cellRem + (N - 1) * gutterRem
 */
export const spanWidthRem = (
  cellCount: number,
  cellSizeRem: number,
  gutterSizeRem: number
): number => {
  if (cellCount <= 0) {
    return 0;
  }

  return cellCount * cellSizeRem + Math.max(cellCount - 1, 0) * gutterSizeRem;
};

/**
 * M칸을 점유하는 높이(rem)를 셀 사이 거터까지 포함해 계산한다.
 * height(M) = M * cellRem + (M - 1) * gutterRem
 */
export const spanHeightRem = (
  cellCount: number,
  cellSizeRem: number,
  gutterSizeRem: number
): number => spanWidthRem(cellCount, cellSizeRem, gutterSizeRem);

/** 브레이크포인트 전체 그리드(Col x Row)가 차지하는 콘텐츠 영역 크기(rem, 거터 포함). */
export const gridContentSizeRem = (
  bp: BreakpointToken,
  aspectLocked = false
): { widthRem: number; heightRem: number } => ({
  widthRem: spanWidthRem(bp.col, cellWidthRem(bp), gutterRem(bp)),
  heightRem: spanHeightRem(
    bp.row,
    effectiveCellHeightRem(bp, aspectLocked),
    gutterRem(bp)
  ),
});

/**
 * 그리드 좌표 (col index, row index) 로부터 셀 원점까지의 오프셋(rem, 거터 포함).
 * offset(index) = index * (cellRem + gutterRem)
 */
export const cellOffsetRem = (
  index: number,
  cellSizeRem: number,
  gutterSizeRem: number
): number => Math.max(index, 0) * (cellSizeRem + gutterSizeRem);

/**
 * 브레이크포인트의 "구간 내부 유동 스케일링" 공식 (CSS의
 * `clamp(fs-min, vw 기반 계산식, fs-max)` 과 동일한 결과를 JS에서도
 * 재현한다). 구간 경계를 넘어가는 브레이크포인트 전환(스냅)은 이 함수가
 * 아니라 상위에서 어떤 BreakpointToken을 넘길지 선택하는 로직
 * (hooks/useViewportBreakpoint.ts, matchBreakpoint)이 담당한다.
 */
export const computeFluidRootFontSizePx = (
  bp: BreakpointToken,
  viewportWidthPx: number
): number => {
  const ratio = bp.fsBasePx / bp.baseWidthPx;
  const raw = ratio * viewportWidthPx;
  const fsMin = ratio * bp.bpMinPx;
  const fsMax = ratio * bp.bpMaxPx;

  return Math.min(Math.max(raw, fsMin), fsMax);
};

export const fsMinPx = (bp: BreakpointToken): number =>
  (bp.fsBasePx / bp.baseWidthPx) * bp.bpMinPx;

export const fsMaxPx = (bp: BreakpointToken): number =>
  (bp.fsBasePx / bp.baseWidthPx) * bp.bpMaxPx;

/** N×M 칸을 점유하는 컨테이너의 렌더링 위치/크기(rem)를 계산한다. */
export interface CellSpanRect {
  leftRem: number;
  topRem: number;
  widthRem: number;
  heightRem: number;
}

export const computeCellSpanRect = (
  bp: BreakpointToken,
  x: number,
  y: number,
  w: number,
  h: number,
  aspectLocked = false
): CellSpanRect => {
  const cellW = cellWidthRem(bp);
  const cellH = effectiveCellHeightRem(bp, aspectLocked);
  const gap = gutterRem(bp);

  return {
    leftRem: cellOffsetRem(x, cellW, gap),
    topRem: cellOffsetRem(y, cellH, gap),
    widthRem: spanWidthRem(w, cellW, gap),
    heightRem: spanHeightRem(h, cellH, gap),
  };
};

/** computeCellSpanRect의 px 버전. DID처럼 vw+clamp 유동 스케일링 없이
 * 항상 고정 px 캔버스(transform: scale()로만 화면에 맞춤)로 렌더링해야
 * 하는 라우트를 위한 것으로, rem 변환을 거치지 않고 브레이크포인트 토큰의
 * px 값을 그대로 사용한다. */
export interface CellSpanRectPx {
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
}

export const computeCellSpanPx = (
  bp: BreakpointToken,
  x: number,
  y: number,
  w: number,
  h: number,
  aspectLocked = false
): CellSpanRectPx => {
  const cellH = effectiveCellHeightPx(bp, aspectLocked);

  return {
    leftPx: cellOffsetRem(x, bp.cellWidthPx, bp.gutterPx),
    topPx: cellOffsetRem(y, cellH, bp.gutterPx),
    widthPx: spanWidthRem(w, bp.cellWidthPx, bp.gutterPx),
    heightPx: spanHeightRem(h, cellH, bp.gutterPx),
  };
};
