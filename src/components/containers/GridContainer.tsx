import type { MouseEvent } from 'react';

import type {
  BuilderMode,
  ContainerEntity,
  ContainerPanel,
} from '@/types/container';
import { openContainerLink } from '@/utils/openContainerLink';

import ContainerShell from './ContainerShell';
import WidgetSlot from './WidgetSlot';
import * as S from './ContainerShell.style';

// 패널 중 하나라도 위젯이 배치되어 있으면 사이즈 결정권이 컨테이너에 고정된다.
const hasAnyWidget = (entity: ContainerEntity) =>
  entity.panels.some((panel) => panel.widget != null);

type GridContainerProps = {
  entity: ContainerEntity;
  title: string;
  isSelected: boolean;
  mode: BuilderMode;
  onSelect: () => void;
  onRemove: () => void;
  onActivePanelChange: (panelIndex: number) => void;
};

const ActivePanel = ({
  entity,
  mode,
}: {
  entity: ContainerEntity;
  mode: BuilderMode;
}) => {
  const panel = entity.panels[entity.activePanelIndex];

  // key로 패널 전환 시 강제 unmount/mount
  return (
    <div key={panel?.id ?? entity.activePanelIndex} style={{ height: '100%' }}>
      <WidgetSlot mode={mode} widget={panel?.widget ?? null} />
    </div>
  );
};

export const DefaultContainerView = (props: GridContainerProps) => {
  const { entity, title, isSelected, mode, onSelect, onRemove } = props;

  return (
    <ContainerShell
      title={title}
      type={entity.type}
      isSelected={isSelected}
      mode={mode}
      isSizeLocked={hasAnyWidget(entity)}
      onSelect={onSelect}
      onRemove={onRemove}
    >
      <div style={S.panelStage}>
        <ActivePanel entity={entity} mode={mode} />
      </div>
    </ContainerShell>
  );
};

export const TabsContainerView = (props: GridContainerProps) => {
  const {
    entity,
    title,
    isSelected,
    mode,
    onSelect,
    onRemove,
    onActivePanelChange,
  } = props;

  return (
    <ContainerShell
      title={title}
      type={entity.type}
      isSelected={isSelected}
      mode={mode}
      isSizeLocked={hasAnyWidget(entity)}
      onSelect={onSelect}
      onRemove={onRemove}
    >
      <div style={S.panelNav}>
        {entity.panels.map((panel, index) => (
          <button
            key={panel.id}
            type='button'
            style={S.panelTab(index === entity.activePanelIndex)}
            onClick={(event) => {
              event.stopPropagation();
              onActivePanelChange(index);
            }}
          >
            {panel.label}
          </button>
        ))}
      </div>
      <div style={S.panelStage}>
        <ActivePanel entity={entity} mode={mode} />
      </div>
    </ContainerShell>
  );
};

// buttons 컨테이너는 tabs/slider와 달리 위젯을 전환하지 않는다. 항상
// panels[0]의 위젯 하나만 콘텐츠로 노출하고, 버튼(및 위젯 자체) 클릭은
// 각 패널에 지정된 link로 화면 전환/링크 이동을 트리거하는 데 사용한다.
export const ButtonsContainerView = (props: GridContainerProps) => {
  const { entity, title, isSelected, mode, onSelect, onRemove } = props;
  const contentPanel = entity.panels[0] ?? null;

  const handleButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    panel: ContainerPanel
  ) => {
    event.stopPropagation();

    if (mode === 'view') {
      openContainerLink(panel.link);
      return;
    }

    onSelect();
  };

  const handleWidgetClick = (event: MouseEvent<HTMLDivElement>) => {
    if (mode !== 'view' || !contentPanel?.link) {
      return;
    }

    event.stopPropagation();
    openContainerLink(contentPanel.link);
  };

  return (
    <ContainerShell
      title={title}
      type={entity.type}
      isSelected={isSelected}
      mode={mode}
      isSizeLocked={hasAnyWidget(entity)}
      onSelect={onSelect}
      onRemove={onRemove}
    >
      <div style={S.panelNav}>
        {entity.panels.map((panel) => (
          <button
            key={panel.id}
            type='button'
            style={S.panelButton(false)}
            onClick={(event) => handleButtonClick(event, panel)}
          >
            {panel.label}
          </button>
        ))}
      </div>
      <div
        style={{
          ...S.panelStage,
          cursor:
            mode === 'view' && contentPanel?.link ? 'pointer' : undefined,
        }}
        onClick={handleWidgetClick}
      >
        <WidgetSlot mode={mode} widget={contentPanel?.widget ?? null} />
      </div>
    </ContainerShell>
  );
};

export const SliderContainerView = (props: GridContainerProps) => {
  const {
    entity,
    title,
    isSelected,
    mode,
    onSelect,
    onRemove,
    onActivePanelChange,
  } = props;

  const goPrev = () => {
    const next =
      (entity.activePanelIndex - 1 + entity.panels.length) %
      entity.panels.length;
    onActivePanelChange(next);
  };

  const goNext = () => {
    const next = (entity.activePanelIndex + 1) % entity.panels.length;
    onActivePanelChange(next);
  };

  return (
    <ContainerShell
      title={title}
      type={entity.type}
      isSelected={isSelected}
      mode={mode}
      isSizeLocked={hasAnyWidget(entity)}
      onSelect={onSelect}
      onRemove={onRemove}
    >
      <div
        style={S.panelStage}
        onPointerDown={(event) => {
          const startX = event.clientX;
          const target = event.currentTarget;

          const handlePointerUp = (upEvent: PointerEvent) => {
            const delta = upEvent.clientX - startX;

            if (Math.abs(delta) > 40) {
              if (delta < 0) {
                goNext();
              } else {
                goPrev();
              }
            }

            target.releasePointerCapture(upEvent.pointerId);
            target.removeEventListener('pointerup', handlePointerUp);
          };

          target.setPointerCapture(event.pointerId);
          target.addEventListener('pointerup', handlePointerUp);
        }}
      >
        {/* 활성 패널만 마운트 — 스와이프 시 이전 위젯 unmount */}
        <ActivePanel entity={entity} mode={mode} />
      </div>
      <div style={S.sliderNav}>
        <button
          type='button'
          style={S.sliderArrow}
          aria-label='이전'
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
        >
          ‹
        </button>
        <div style={S.sliderDots}>
          {entity.panels.map((panel, index) => (
            <span
              key={panel.id}
              style={S.sliderDot(index === entity.activePanelIndex)}
            />
          ))}
        </div>
        <button
          type='button'
          style={S.sliderArrow}
          aria-label='다음'
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
        >
          ›
        </button>
      </div>
    </ContainerShell>
  );
};

const GridContainer = (props: GridContainerProps) => {
  switch (props.entity.type) {
    case 'tabs':
      return <TabsContainerView {...props} />;
    case 'slider':
      return <SliderContainerView {...props} />;
    case 'buttons':
      return <ButtonsContainerView {...props} />;
    case 'default':
    default:
      return <DefaultContainerView {...props} />;
  }
};

export default GridContainer;
