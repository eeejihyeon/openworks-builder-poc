import type { CSSProperties } from 'react';

export const builderLayout: CSSProperties = {
  display: 'flex',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  minHeight: '100vh',
  overflow: 'hidden',
  backgroundColor: '#f1f5f9',
  textAlign: 'left',
};

export const mainArea: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: '16px',
  overflow: 'auto',
};

export const gridWrapper: CSSProperties = {
  position: 'relative',
  flexShrink: 0,
};
