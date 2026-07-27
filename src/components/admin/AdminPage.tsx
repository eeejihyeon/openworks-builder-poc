import type { CSSProperties } from 'react';

import { ADMIN_NAV_LABEL } from '@/constants/uiButtonOrder';
import { useDashboardStore } from '@/store/useDashboardStore';

const page: CSSProperties = {
  minHeight: '100vh',
  padding: '32px',
  backgroundColor: '#f1f5f9',
};

const card: CSSProperties = {
  maxWidth: '640px',
  padding: '24px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const title: CSSProperties = {
  margin: '0 0 8px',
  fontSize: '20px',
  fontWeight: 700,
  color: '#0f172a',
};

const description: CSSProperties = {
  margin: '0 0 20px',
  fontSize: '14px',
  color: '#64748b',
  lineHeight: 1.6,
};

const backButton: CSSProperties = {
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#1d4ed8',
  backgroundColor: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: '6px',
  cursor: 'pointer',
};

const AdminPage = () => {
  const setCurrentPage = useDashboardStore((state) => state.setCurrentPage);

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>{ADMIN_NAV_LABEL} 페이지 (POC)</h1>
        <p style={description}>
          헤더의 관리자 이동 버튼은 고정 위치로 노출됩니다. 실제 관리 기능은
          이후 단계에서 연결합니다.
        </p>
        <button
          type='button'
          style={backButton}
          onClick={() => setCurrentPage('builder')}
        >
          빌더로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
