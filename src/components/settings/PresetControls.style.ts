import type { CSSProperties } from 'react';

export const container: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

export const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

export const presetList: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  maxWidth: '320px',
};

export const presetItem = (isActive: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  border: isActive ? '1px solid #93c5fd' : '1px solid #e2e8f0',
  backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
  borderRadius: '6px',
  overflow: 'hidden',
});

export const presetItemButton = (isActive: boolean): CSSProperties => ({
  padding: '6px 8px',
  fontSize: '13px',
  fontWeight: isActive ? 600 : 400,
  color: isActive ? '#1d4ed8' : '#334155',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
});

export const presetItemRemove: CSSProperties = {
  padding: '6px 8px',
  fontSize: '13px',
  color: '#ef4444',
  backgroundColor: 'transparent',
  border: 'none',
  borderLeft: '1px solid #e2e8f0',
  cursor: 'pointer',
};

export const savePanel: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '6px',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  minWidth: '280px',
  padding: '12px',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
};

export const radioRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: '#334155',
};

export const select: CSSProperties = {
  flex: 1,
  padding: '5px 6px',
  fontSize: '12px',
  color: '#334155',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
};

export const nameInput: CSSProperties = {
  flex: 1,
  padding: '5px 6px',
  fontSize: '12px',
  color: '#334155',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
};

export const savePanelActions: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '6px',
  marginTop: '2px',
};
