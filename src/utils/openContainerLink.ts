/**
 * buttons 컨테이너의 버튼/위젯 클릭 시 지정된 링크로 이동한다.
 * - `/`, `#`로 시작하면 내부 경로로 간주해 현재 창에서 이동
 * - 그 외에는 외부 URL로 간주해 새 탭에서 연다
 */
export const openContainerLink = (link: string | null | undefined) => {
  if (!link) {
    return;
  }

  const trimmed = link.trim();

  if (!trimmed) {
    return;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    window.location.href = trimmed;
    return;
  }

  window.open(trimmed, '_blank', 'noopener,noreferrer');
};
