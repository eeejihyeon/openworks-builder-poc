import type { CSSProperties } from 'react';

export const builderLayout: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f1f5f9',
};

export const mainArea: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: '16px',
  overflow: 'auto',
};

export const gridWrapper: CSSProperties = {
  position: 'relative',
};
