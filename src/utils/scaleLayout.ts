import type { Layout } from "react-grid-layout";

const scaleDimension = (
  value: number,
  fromCols: number,
  toCols: number,
  max: number,
) => {
  const scaled = Math.round((value * toCols) / fromCols);
  return Math.max(0, Math.min(scaled, max));
};

export const scaleLayout = (
  layout: Layout,
  fromCols: number,
  toCols: number,
): Layout => {
  if (fromCols === toCols) {
    return layout;
  }

  return layout.map((item) => {
    const width = Math.max(
      1,
      scaleDimension(item.w, fromCols, toCols, toCols),
    );
    const x = Math.max(
      0,
      Math.min(
        toCols - width,
        scaleDimension(item.x, fromCols, toCols, toCols - width),
      ),
    );

    return {
      ...item,
      x,
      w: width,
      ...(item.minW !== undefined && {
        minW: Math.max(
          1,
          scaleDimension(item.minW, fromCols, toCols, toCols),
        ),
      }),
      ...(item.maxW !== undefined && {
        maxW: Math.max(
          1,
          scaleDimension(item.maxW, fromCols, toCols, toCols),
        ),
      }),
    };
  });
};
