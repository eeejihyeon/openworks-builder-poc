import type { CSSProperties } from 'react';

export const page: CSSProperties = {
  position: 'relative',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: '#020617',
};

export const backButton: CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 20,
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
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 20,
  display: 'flex',
  gap: '8px',
  padding: '6px 10px',
  fontSize: '11px',
  fontFamily: 'monospace',
  color: '#94a3b8',
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
};

export const badgeStrong: CSSProperties = {
  color: '#38bdf8',
  fontWeight: 700,
};

export const letterboxArea: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/** 실제 물리 해상도와 무관하게 항상 1080x1920 px 로 고정되는 캔버스.
 * 화면에 맞추는 축소/확대는 오직 `transform: scale()` 로만 처리해,
 * 내부 레이아웃(px 좌표)이 어떤 디바이스에서도 절대 바뀌지 않게 한다. */
export const canvas: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  backgroundColor: '#f1f5f9',
  flexShrink: 0,
  transformOrigin: 'center center',
  overflow: 'hidden',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6)',
};

export const emptyState: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '80px 24px',
  color: '#94a3b8',
  fontSize: '20px',
  textAlign: 'center',
};

export const emptyStateTitle: CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#475569',
};
