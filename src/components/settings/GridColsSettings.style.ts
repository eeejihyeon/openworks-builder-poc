import type { CSSProperties } from "react";

export const toolbar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "16px",
  padding: "12px 16px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

export const settingSection: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

export const sectionDivider: CSSProperties = {
  width: "1px",
  alignSelf: "stretch",
  backgroundColor: "#e2e8f0",
};

export const sizeGroup: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

export const sizeRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

export const sizeLabel: CSSProperties = {
  width: "28px",
  fontSize: "12px",
  color: "#94a3b8",
  whiteSpace: "nowrap",
};

export const label: CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  whiteSpace: "nowrap",
};

export const presetGroup: CSSProperties = {
  display: "flex",
  gap: "6px",
};

export const presetButton = (isActive: boolean): CSSProperties => ({
  minWidth: "36px",
  padding: "6px 10px",
  fontSize: "13px",
  fontWeight: isActive ? 600 : 400,
  color: isActive ? "#1d4ed8" : "#64748b",
  backgroundColor: isActive ? "#eff6ff" : "#f8fafc",
  border: isActive ? "1px solid #93c5fd" : "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: "pointer",
});

export const historyButton = (isEnabled: boolean): CSSProperties => ({
  minWidth: "56px",
  padding: "6px 10px",
  fontSize: "13px",
  fontWeight: 400,
  color: isEnabled ? "#64748b" : "#cbd5e1",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: isEnabled ? "pointer" : "not-allowed",
});

export const customGroup: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

export const customLabel: CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  whiteSpace: "nowrap",
};

export const customInput: CSSProperties = {
  width: "56px",
  padding: "6px 8px",
  fontSize: "13px",
  color: "#334155",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  textAlign: "center",
};

export const currentValue: CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  whiteSpace: "nowrap",
};

export const historyControls: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
};

export const historyActions: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

export const historyActionRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

export const historyPanel: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "220px",
  maxHeight: "180px",
  overflowY: "auto",
  padding: "4px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
};

export const historyItem = (isActive: boolean): CSSProperties => ({
  display: "block",
  width: "100%",
  padding: "8px 10px",
  fontSize: "12px",
  fontWeight: isActive ? 600 : 400,
  color: isActive ? "#1d4ed8" : "#475569",
  textAlign: "left",
  backgroundColor: isActive ? "#eff6ff" : "transparent",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
});

export const historyToggleButton = (isOpen: boolean): CSSProperties => ({
  minWidth: "72px",
  padding: "6px 10px",
  fontSize: "13px",
  fontWeight: isOpen ? 600 : 400,
  color: isOpen ? "#1d4ed8" : "#64748b",
  backgroundColor: isOpen ? "#eff6ff" : "#f8fafc",
  border: isOpen ? "1px solid #93c5fd" : "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: "pointer",
});

export const zoneList: CSSProperties = {
  margin: "10px 0 0",
  padding: "0",
  listStyle: "none",
};

export const zoneListItem: CSSProperties = {
  padding: "6px 8px",
  fontSize: "12px",
  color: "#64748b",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "6px",
};
