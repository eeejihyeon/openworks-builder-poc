/**
 * 헤더·사이드바 버튼 노출 순서 (고정)
 * 관리자 페이지 이동 버튼은 헤더 끝단에 고정 배치
 */
export const HEADER_BUTTON_ORDER = [
  'appSelector',
  'undoRedo',
  'layoutSave',
  'presetControls',
  'builderMode',
  'gridCols',
  'gridRows',
  'gridGap',
  'gridSize',
  'gridLines',
  'reservedZones',
  'viewerNav',
  'didNav',
  'adminNav',
] as const;

export type HeaderButtonId = (typeof HEADER_BUTTON_ORDER)[number];

export const SIDEBAR_SECTION_ORDER = [
  'containerTypes',
  'widgetList',
  'widgetDataForm',
] as const;

export type SidebarSectionId = (typeof SIDEBAR_SECTION_ORDER)[number];

export const ADMIN_PAGE_PATH = '/admin';
export const ADMIN_NAV_LABEL = '관리자';
export const VIEWER_NAV_LABEL = '뷰어 모드로 전환';
export const BUILDER_NAV_LABEL = '← 편집으로 돌아가기';
export const DID_NAV_LABEL = 'DID 이동';
