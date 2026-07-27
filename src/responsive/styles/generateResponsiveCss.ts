/**
 * 토큰 테이블(tokens/breakpoints.ts) -> 실제 CSS 문자열 생성기.
 *
 * 핵심 설계(요구사항 매핑):
 * - "html 루트 font-size 단일 지점에 vw+clamp() 적용, 하위 요소 전체 rem
 *   파생" -> `html.rs-root { font-size: clamp(...) }` 규칙이 파일 전체에서
 *   단 한 번만 등장한다. 이후 모든 값은 rem/CSS 변수로 파생된다.
 * - "구간 내부 유동 스케일링과 구간 경계 즉시 스냅 전환의 코드 분리" ->
 *   유동 스케일링 공식(vw 기반 calc)은 buildFluidFormula() 한 곳에만
 *   존재하고, 스냅 전환은 별도의 @media 블록(buildBreakpointBlock())이
 *   전담한다. 두 관심사가 서로 다른 함수/블록으로 분리되어 있다.
 * - "뷰포트 1921px 이상에서 root font-size 16px 고정, 초과 여백은 margin" ->
 *   buildWideViewportBlock() 이 별도로 처리한다.
 * - "셀 너비 rem 지정 + aspect-ratio 기반 높이 자동 산출" ->
 *   `.rs-cell-unit` 규칙 (브레이크포인트 무관, Cell 이 항상 48:32 비율).
 */

import {
  BREAKPOINTS,
  DESKTOP_BREAKPOINT,
  REM_BASE_PX,
  WIDE_ROOT_FONT_SIZE_PX,
  WIDE_VIEWPORT_MIN_PX,
  type BreakpointToken,
} from '@/responsive/tokens/breakpoints';
import {
  cellHeightRem,
  cellWidthRem,
  fsMaxPx,
  fsMinPx,
  gutterRem,
  marginBlockRem,
  marginInlineRem,
} from '@/responsive/utils/gridMath';

const round = (value: number, precision = 6): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const px = (value: number): string => `${round(value)}px`;
const rem = (value: number): string => `${round(value)}rem`;

/** 구간 내부 "유동 스케일링" 공식. vw 기반 calc() 한 줄로 표현된다. */
const buildFluidFormula = (bp: BreakpointToken): string =>
  `calc(100vw * ${round(bp.fsBasePx)} / ${round(bp.baseWidthPx)})`;

const buildTokenDeclarations = (bp: BreakpointToken): string => `
    --rs-bp-id: '${bp.id}';
    --rs-fs-min: ${px(fsMinPx(bp))};
    --rs-fs-max: ${px(fsMaxPx(bp))};
    --rs-fs-fluid: ${buildFluidFormula(bp)};
    --rs-cell-w: ${rem(cellWidthRem(bp))};
    --rs-cell-h: ${rem(cellHeightRem(bp))};
    --rs-gutter: ${rem(gutterRem(bp))};
    --rs-margin-block: ${rem(marginBlockRem(bp))};
    --rs-margin-inline: ${rem(marginInlineRem(bp))};
    --rs-col: ${bp.col};
    --rs-row: ${bp.row};
    --rs-base-w: ${px(bp.baseWidthPx)};
    --rs-base-h: ${px(bp.baseHeightPx)};`;

/** 브레이크포인트 "구간 경계 즉시 스냅 전환" 블록. 미디어쿼리 경계를
 * 벗어나는 순간 값 전체가 통째로 교체되어 보간 없이 스냅된다.
 * max-width 에 0.98px 오프셋을 더해(관용적인 기법) 소수점 뷰포트
 * 너비에서 두 구간이 모두 매칭되지 않는 사각지대가 생기지 않게 한다. */
const buildBreakpointBlock = (bp: BreakpointToken): string => `
/* ${bp.label} : ${bp.bpMinPx}px ~ ${bp.bpMaxPx}px (base ${bp.baseWidthPx}x${bp.baseHeightPx}) */
@media (min-width: ${px(bp.bpMinPx)}) and (max-width: ${px(bp.bpMaxPx + 0.98)}) {
  html.rs-root {${buildTokenDeclarations(bp)}
  }
}`;

/** 1921px 이상: root font-size 16px 고정 + 초과 여백은 .rs-stage margin으로 처리. */
const buildWideViewportBlock = (): string => {
  const desktop = DESKTOP_BREAKPOINT;
  const stageMaxWidthRem = round(desktop.baseWidthPx / REM_BASE_PX);

  return `
/* Wide (>= ${WIDE_VIEWPORT_MIN_PX}px) : root font-size ${WIDE_ROOT_FONT_SIZE_PX}px 고정, 초과 여백은 margin 처리 */
@media (min-width: ${px(WIDE_VIEWPORT_MIN_PX)}) {
  html.rs-root {
    --rs-fs-min: ${px(WIDE_ROOT_FONT_SIZE_PX)};
    --rs-fs-max: ${px(WIDE_ROOT_FONT_SIZE_PX)};
    --rs-fs-fluid: ${px(WIDE_ROOT_FONT_SIZE_PX)};
    --rs-cell-w: ${rem(cellWidthRem(desktop))};
    --rs-cell-h: ${rem(cellHeightRem(desktop))};
    --rs-gutter: ${rem(gutterRem(desktop))};
    --rs-margin-block: ${rem(marginBlockRem(desktop))};
    --rs-margin-inline: ${rem(marginInlineRem(desktop))};
    --rs-col: ${desktop.col};
    --rs-row: ${desktop.row};
    --rs-base-w: ${px(desktop.baseWidthPx)};
    --rs-base-h: ${px(desktop.baseHeightPx)};
  }

  html.rs-root .rs-stage {
    max-width: ${stageMaxWidthRem}rem;
    margin-inline: auto;
  }
}`;
};

const STATIC_RULES = `
html.rs-root {
  /* 단일 지점: vw + clamp(). 하위 요소는 전부 rem 으로 파생된다. */
  font-size: clamp(var(--rs-fs-min), var(--rs-fs-fluid), var(--rs-fs-max));
}

html.rs-root .rs-stage {
  box-sizing: border-box;
  width: 100%;
  padding-block: var(--rs-margin-block);
  padding-inline: var(--rs-margin-inline);
}

html.rs-root .rs-grid-surface {
  position: relative;
  box-sizing: content-box;
}

/* 셀 너비는 rem 지정, 높이는 aspect-ratio(48:32 = 3:2)로 자동 산출 */
html.rs-root .rs-cell-unit {
  width: var(--rs-cell-w);
  aspect-ratio: 3 / 2;
  height: auto;
  box-sizing: border-box;
}

html.rs-root .rs-item {
  position: absolute;
  box-sizing: border-box;
}

/* 일반 대시보드(태블릿/모바일 CCTV 제외): 가로/세로 전환 시 레이아웃
 * 재계산 없이 스크롤로만 대응한다. */
html.rs-root .rs-scroll-fallback {
  overflow: auto;
}
`;

export const generateResponsiveCss = (
  breakpoints: BreakpointToken[] = BREAKPOINTS
): string => {
  const defaultBp = breakpoints[0];

  const blocks = [
    `:root {\n  --rs-rem-base: ${REM_BASE_PX};\n}`,
    STATIC_RULES,
    `/* 초기값(첫 매칭 전 fallback) */\nhtml.rs-root {${buildTokenDeclarations(
      defaultBp
    )}\n}`,
    ...breakpoints.map(buildBreakpointBlock),
    buildWideViewportBlock(),
  ];

  return blocks.join('\n');
};
