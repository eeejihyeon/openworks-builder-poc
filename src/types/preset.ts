import type { Layout } from 'react-grid-layout/legacy';

import type { ContainerEntity } from '@/types/container';

/**
 * "컨테이너 배치" 프리셋 모델 (POC).
 *
 * - 그리드 설정(cols/rows/gap 등)은 포함하지 않고 layout(위치/크기) +
 *   containers(패널/위젯 구성)만 다룬다. 즉 "지금 사용 중인 컨테이너
 *   배치"를 이름을 붙여 저장/재적용하기 위한 최소 단위.
 * - 현재는 Page 개념이 없어(단일 캔버스) 스토어 최상위의 `presetId`가
 *   "현재 Page가 참조 중인 프리셋"을 의미한다. 추후 Page/Container 단위로
 *   세분화되면 이 필드를 해당 엔티티로 옮기면 된다.
 */
export type ContainerLayoutPreset = {
  id: string;
  name: string;
  layout: Layout;
  containers: Record<string, ContainerEntity>;
  createdAt: string;
  updatedAt: string;
};
