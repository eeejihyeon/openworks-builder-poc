import { useMemo } from "react";
import { calcGridCellDimensions } from "react-grid-layout/core";

import type { ForbiddenZone } from "@/types/forbiddenZone";

import * as S from "./ForbiddenZonesOverlay.style";

type ForbiddenZonesOverlayProps = {
  width: number;
  cols: number;
  rowHeight: number;
  margin: [number, number];
  rows: number;
  zones: ForbiddenZone[];
};

const ZONE_FILL = "rgba(248, 113, 113, 0.28)";
const ZONE_STROKE = "rgba(220, 38, 38, 0.55)";
const STRIPE_FILL = "rgba(248, 113, 113, 0.18)";

const ForbiddenZonesOverlay = ({
  width,
  cols,
  rowHeight,
  margin,
  rows,
  zones,
}: ForbiddenZonesOverlayProps) => {
  const cellDimensions = useMemo(
    () =>
      calcGridCellDimensions({
        width,
        cols,
        rowHeight,
        margin,
      }),
    [width, cols, rowHeight, margin],
  );

  const totalHeight = useMemo(() => {
    const paddingY = margin[1];

    return (
      paddingY * 2 + rows * rowHeight + Math.max(0, rows - 1) * margin[1]
    );
  }, [margin, rowHeight, rows]);

  const zoneElements = useMemo(() => {
    const { cellWidth, cellHeight, offsetX, offsetY, gapX, gapY } =
      cellDimensions;

    return zones.map((zone) => {
      const x = offsetX + zone.x * (cellWidth + gapX);
      const y = offsetY + zone.y * (cellHeight + gapY);
      const zoneWidth = zone.w * cellWidth + Math.max(0, zone.w - 1) * gapX;
      const zoneHeight = zone.h * cellHeight + Math.max(0, zone.h - 1) * gapY;
      const labelX = x + zoneWidth / 2;
      const labelY = y + zoneHeight / 2;

      return (
        <g key={zone.id}>
          <rect
            x={x}
            y={y}
            width={zoneWidth}
            height={zoneHeight}
            rx={4}
            ry={4}
            fill={ZONE_FILL}
            stroke={ZONE_STROKE}
            strokeWidth={1}
            strokeDasharray="6 4"
          />
          <rect
            x={x}
            y={y}
            width={zoneWidth}
            height={zoneHeight}
            rx={4}
            ry={4}
            fill="url(#forbidden-zone-stripes)"
          />
          {zone.label && (
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              style={S.zoneLabel}
            >
              {zone.label}
            </text>
          )}
        </g>
      );
    });
  }, [cellDimensions, zones]);

  if (zones.length === 0) {
    return null;
  }

  return (
    <svg
      aria-hidden
      style={{ ...S.overlay, width, height: totalHeight }}
    >
      <defs>
        <pattern
          id="forbidden-zone-stripes"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" fill="transparent" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="8"
            stroke={STRIPE_FILL}
            strokeWidth="4"
          />
        </pattern>
      </defs>
      {zoneElements}
    </svg>
  );
};

export default ForbiddenZonesOverlay;
