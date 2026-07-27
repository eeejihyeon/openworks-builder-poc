import type { CSSProperties } from 'react';

export const wrapper = (isSelected: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
  boxShadow: isSelected
    ? '0 0 0 3px rgba(59, 130, 246, 0.15)'
    : '0 1px 4px rgba(0,0,0,0.06)',
  overflow: 'hidden',
  cursor: 'pointer',
});

export const header: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
};

export const dragHandleArea: CSSProperties = {
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
  minWidth: 0,
  cursor: 'grab',
  userSelect: 'none',
};

export const title: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  letterSpacing: '0.4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const typeBadge: CSSProperties = {
  flexShrink: 0,
  padding: '2px 6px',
  fontSize: '10px',
  fontWeight: 600,
  color: '#1d4ed8',
  backgroundColor: '#eff6ff',
  borderRadius: '4px',
};

export const sizeLockBadge: CSSProperties = {
  flexShrink: 0,
  padding: '2px 6px',
  fontSize: '10px',
  fontWeight: 600,
  color: '#b45309',
  backgroundColor: '#fef3c7',
  borderRadius: '4px',
  whiteSpace: 'nowrap',
};

export const dragHandleIcon: CSSProperties = {
  flexShrink: 0,
  fontSize: '16px',
  color: '#cbd5e1',
  lineHeight: 1,
};

export const removeButton: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  padding: 0,
  border: 'none',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  fontSize: '18px',
  lineHeight: 1,
  cursor: 'pointer',
};

export const body: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
};

export const panelNav: CSSProperties = {
  display: 'flex',
  gap: '4px',
  padding: '8px 10px 0',
  flexShrink: 0,
};

export const panelTab = (isActive: boolean): CSSProperties => ({
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: isActive ? 600 : 400,
  color: isActive ? '#1d4ed8' : '#64748b',
  backgroundColor: isActive ? '#eff6ff' : 'transparent',
  border: 'none',
  borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
  borderRadius: '4px 4px 0 0',
  cursor: 'pointer',
});

export const panelButton = (isActive: boolean): CSSProperties => ({
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: isActive ? 600 : 400,
  color: isActive ? '#1d4ed8' : '#64748b',
  backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
  border: isActive ? '1px solid #93c5fd' : '1px solid #e2e8f0',
  borderRadius: '6px',
  cursor: 'pointer',
});

export const sliderNav: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 10px',
  flexShrink: 0,
};

export const sliderArrow: CSSProperties = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  backgroundColor: '#f8fafc',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: '14px',
};

export const sliderDots: CSSProperties = {
  display: 'flex',
  gap: '6px',
};

export const sliderDot = (isActive: boolean): CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: isActive ? '#3b82f6' : '#cbd5e1',
});

export const panelStage: CSSProperties = {
  flex: 1,
  minHeight: 0,
  padding: '10px',
  overflow: 'hidden',
};

export const emptySlot = (mode: 'edit' | 'view'): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  height: '100%',
  borderRadius: '6px',
  border: mode === 'edit' ? '1px dashed #94a3b8' : 'none',
  backgroundColor: mode === 'edit' ? '#f8fafc' : 'transparent',
  color: '#94a3b8',
  fontSize: '12px',
  textAlign: 'center',
  padding: '12px',
});

export const widgetCard: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '6px',
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  padding: '10px 12px',
  overflow: 'auto',
};

export const widgetTitle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '6px',
};

export const widgetMeta: CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  lineHeight: 1.5,
};
