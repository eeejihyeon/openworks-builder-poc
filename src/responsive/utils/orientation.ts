/** 뷰포트 방향(orientation) 판별 + 구독 유틸. matchMedia 기반이라 리사이즈
 * 폴링 없이 실제 방향 전환 시점에만 콜백이 호출된다. */

export type Orientation = 'portrait' | 'landscape';

export const getOrientation = (
  widthPx: number,
  heightPx: number
): Orientation => (widthPx >= heightPx ? 'landscape' : 'portrait');

export const subscribeOrientation = (
  callback: (orientation: Orientation) => void
): (() => void) => {
  const mql = window.matchMedia('(orientation: landscape)');

  const handler = () => {
    callback(mql.matches ? 'landscape' : 'portrait');
  };

  handler();

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }

  // Safari 구버전 fallback
  mql.addListener(handler);
  return () => mql.removeListener(handler);
};
