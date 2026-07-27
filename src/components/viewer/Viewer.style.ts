import type { CSSProperties } from 'react';

export const page: CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#f1f5f9',
  overflow: 'auto',
};

export const topBar: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '8px 16px',
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  color: '#e2e8f0',
};

export const backButton: CSSProperties = {
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#0f172a',
  backgroundColor: '#38bdf8',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

export const badge: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '12px',
  fontFamily: 'monospace',
  color: '#94a3b8',
};

export const badgeStrong: CSSProperties = {
  color: '#38bdf8',
  fontWeight: 700,
};

export const stage: CSSProperties = {
  boxSizing: 'border-box',
};

export const gridSurfaceWrapper: CSSProperties = {
  margin: '0 auto',
};

export const emptyState: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '80px 24px',
  color: '#94a3b8',
  fontSize: '14px',
  textAlign: 'center',
};

export const emptyStateTitle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#475569',
};
