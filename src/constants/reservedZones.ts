/**
 * 기본 그리드(30열 × 20행) 기준 Header/Sidebar 고정 노출 영역.
 *
 * Header·Sidebar가 고정 노출 상태일 때 해당 영역은 그리드를 점유하며,
 * 컨테이너는 이를 제외한 남은 가용 영역에만 배치할 수 있다.
 */

export const HEADER_ZONE_ID = 'header-fixed-zone';
export const SIDEBAR_ZONE_ID = 'sidebar-fixed-zone';

export const HEADER_ZONE_LABEL = 'Header (고정 노출)';
export const SIDEBAR_ZONE_LABEL = 'Sidebar (고정 노출)';

/** 기본 20행 기준 상단 2행을 Header 영역으로 고정 점유 */
export const HEADER_ZONE_ROWS = 2;

/** 기본 30열 기준 좌측 6열을 Sidebar 영역으로 고정 점유 */
export const SIDEBAR_ZONE_COLS = 6;
