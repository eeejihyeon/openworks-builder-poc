import type { MouseEvent, ReactNode } from 'react';

import type { BuilderMode, ContainerType } from '@/types/container';
import { CONTAINER_TYPE_LABEL } from '@/constants/containerCatalog';

import * as S from './ContainerShell.style';

type ContainerShellProps = {
  title: string;
  type: ContainerType;
  isSelected: boolean;
  mode: BuilderMode;
  /** 위젯이 배치되어 사이즈가 잠긴 상태인지 여부 (리사이즈 불가 표시용) */
  isSizeLocked?: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  children: ReactNode;
};

const ContainerShell = ({
  title,
  type,
  isSelected,
  mode,
  isSizeLocked,
  onSelect,
  onRemove,
  children,
}: ContainerShellProps) => {
  const handleClickRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.();
  };

  return (
    <div
      style={S.wrapper(isSelected)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      role='presentation'
    >
      <div style={S.header}>
        <div className='widget-drag-handle' style={S.dragHandleArea}>
          <span style={S.title}>{title}</span>
          <span style={S.typeBadge}>{CONTAINER_TYPE_LABEL[type]}</span>
          {mode === 'edit' && isSizeLocked && (
            <span style={S.sizeLockBadge} title='위젯이 배치되어 사이즈가 잠겼습니다'>
              🔒 사이즈 고정
            </span>
          )}
          <span style={S.dragHandleIcon}>⠿</span>
        </div>
        {mode === 'edit' && onRemove && (
          <button
            type='button'
            aria-label={`${title} 제거`}
            style={S.removeButton}
            onClick={handleClickRemove}
          >
            ×
          </button>
        )}
      </div>
      <div style={S.body}>{children}</div>
    </div>
  );
};

export default ContainerShell;
