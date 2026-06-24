import type { ReactNode } from 'react';

import * as S from './TabContainer.style';

type TabContainerProps = {
  title: string;
  children?: ReactNode;
};

const TabContainer = ({ title, children }: TabContainerProps) => {
  return (
    <div style={S.wrapper}>
      <div className='widget-drag-handle' style={S.header}>
        <span style={S.title}>{title}</span>
        <span style={S.dragHandle}>⠿</span>
      </div>
      <div style={S.content}>{children ?? `${title} 위젯`}</div>
    </div>
  );
};

export default TabContainer;
