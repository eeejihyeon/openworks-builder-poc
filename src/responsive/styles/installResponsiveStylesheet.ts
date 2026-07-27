/**
 * generateResponsiveCss() 결과를 실제 <style> 태그로 문서에 주입/제거한다.
 * "뷰어 모드"에 진입할 때만 <html> 에 `rs-root` 클래스를 부여해 기존
 * 빌더/관리자 화면의 폰트 체계에는 영향을 주지 않는다.
 */

import { BREAKPOINTS, type BreakpointToken } from '@/responsive/tokens/breakpoints';
import { generateResponsiveCss } from '@/responsive/styles/generateResponsiveCss';

const STYLE_TAG_ID = 'responsive-viewer-tokens';
const ROOT_CLASS = 'rs-root';
const ASPECT_LOCKED_CLASS = 'rs-aspect-locked';

let refCount = 0;

export const installResponsiveStylesheet = (
  breakpoints: BreakpointToken[] = BREAKPOINTS
): (() => void) => {
  refCount += 1;

  if (refCount === 1) {
    let styleEl = document.getElementById(
      STYLE_TAG_ID
    ) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_TAG_ID;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = generateResponsiveCss(breakpoints);
    document.documentElement.classList.add(ROOT_CLASS);
  }

  return () => {
    refCount = Math.max(0, refCount - 1);

    if (refCount === 0) {
      document.documentElement.classList.remove(ROOT_CLASS);
      document.documentElement.classList.remove(ASPECT_LOCKED_CLASS);
      document.getElementById(STYLE_TAG_ID)?.remove();
    }
  };
};

/** 뷰어에서 비율 고정 ON/OFF에 따라 html 클래스를 토글한다. */
export const setResponsiveAspectLocked = (locked: boolean) => {
  document.documentElement.classList.toggle(ASPECT_LOCKED_CLASS, locked);
};

export const RESPONSIVE_ROOT_CLASS = ROOT_CLASS;
export const RESPONSIVE_ASPECT_LOCKED_CLASS = ASPECT_LOCKED_CLASS;
