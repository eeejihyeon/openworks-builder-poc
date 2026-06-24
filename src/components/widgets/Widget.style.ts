import type { CSSProperties } from "react";

export const wrapper: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

export const header: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  backgroundColor: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

export const dragHandleArea: CSSProperties = {
  display: "flex",
  flex: 1,
  alignItems: "center",
  justifyContent: "space-between",
  minWidth: 0,
  cursor: "grab",
  userSelect: "none",
};

export const title: CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#475569",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const dragHandleIcon: CSSProperties = {
  flexShrink: 0,
  fontSize: "16px",
  color: "#cbd5e1",
  lineHeight: 1,
};

export const removeButton: CSSProperties = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  padding: 0,
  border: "none",
  borderRadius: "4px",
  backgroundColor: "transparent",
  color: "#94a3b8",
  fontSize: "18px",
  lineHeight: 1,
  cursor: "pointer",
};

export const content: CSSProperties = {
  flex: 1,
  padding: "14px",
  overflowY: "auto",
  color: "#94a3b8",
  fontSize: "13px",
};
