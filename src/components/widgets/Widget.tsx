import type { MouseEvent, ReactNode } from 'react';

import * as S from './Widget.style';

type WidgetProps = {
  title: string;
  onClickRemove?: () => void;
  children?: ReactNode;
};

const Widget = ({ title, onClickRemove, children }: WidgetProps) => {
  const handleClickRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClickRemove?.();
  };

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <div className='widget-drag-handle' style={S.dragHandleArea}>
          <span style={S.title}>{title}</span>
          <span style={S.dragHandleIcon}>⠿</span>
        </div>
        {onClickRemove && (
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
      <div style={S.content}>{children ?? `${title} 위젯`}</div>
    </div>
  );
};

export default Widget;
