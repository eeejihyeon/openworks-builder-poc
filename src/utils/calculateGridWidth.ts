export const calculateGridWidth = (
  colWidth: number,
  cols: number,
  horizontalGap: number,
) => colWidth * cols + horizontalGap * (cols + 1);
