import type { CSSProperties } from 'react';

export const wrapper: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

export const header: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  cursor: 'grab',
  userSelect: 'none',
};

export const title: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
};

export const dragHandle: CSSProperties = {
  fontSize: '16px',
  color: '#cbd5e1',
  lineHeight: 1,
};

export const content: CSSProperties = {
  flex: 1,
  padding: '14px',
  overflowY: 'auto',
  color: '#94a3b8',
  fontSize: '13px',
};
