import type { CSSProperties } from 'react';

export const sidebar: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '240px',
  flexShrink: 0,
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e2e8f0',
  minHeight: '120vh',
};

export const header: CSSProperties = {
  padding: '16px',
  borderBottom: '1px solid #e2e8f0',
};

export const title: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: '#334155',
};

export const description: CSSProperties = {
  margin: '6px 0 0',
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: 1.5,
};

export const list: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
  overflowY: 'auto',
};

export const itemButton = (isDragging: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  width: '100%',
  padding: '12px',
  textAlign: 'left',
  backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
  border: isDragging ? '1px solid #93c5fd' : '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'grab',
});

export const itemLabel: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
};

export const itemDescription: CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  lineHeight: 1.4,
};

export const itemMeta: CSSProperties = {
  fontSize: '11px',
  color: '#94a3b8',
};

export const sectionHeader: CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0',
};

export const emptyHint: CSSProperties = {
  margin: 0,
  padding: '8px 4px',
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: 1.5,
};

export const clearButton: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#b91c1c',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  cursor: 'pointer',
};
