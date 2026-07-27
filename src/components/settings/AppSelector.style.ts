import type { CSSProperties } from 'react';

export const wrapper: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

export const appButtonGroup: CSSProperties = {
  display: 'flex',
  gap: '6px',
};

export const appButton = (isActive: boolean): CSSProperties => ({
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: isActive ? 700 : 400,
  color: isActive ? '#ffffff' : '#475569',
  backgroundColor: isActive ? '#6366f1' : '#f8fafc',
  border: isActive ? '1px solid #6366f1' : '1px solid #e2e8f0',
  borderRadius: '6px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export const specLine: CSSProperties = {
  fontSize: '11px',
  color: '#94a3b8',
  whiteSpace: 'nowrap',
};
