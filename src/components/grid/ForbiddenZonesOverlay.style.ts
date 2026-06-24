import type { CSSProperties } from "react";

export const overlay: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  pointerEvents: "none",
  zIndex: 5,
};

export const zoneLabel: CSSProperties = {
  fill: "#b91c1c",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.4px",
  textTransform: "uppercase",
};
