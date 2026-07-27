import type { Layout } from 'react-grid-layout';

export const layoutExceedsMaxRows = (layout: Layout, maxRows: number) =>
  layout.some((item) => item.y + item.h > maxRows);
