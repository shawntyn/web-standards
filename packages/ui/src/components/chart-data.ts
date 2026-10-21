export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartProps {
  title: string;
  description?: string;
  unit: string;
  emptyText: string;
  points: ChartPoint[];
}

export function assertNonnegativeFinite(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("Chart values must be finite and nonnegative.");
  }
}

export function chartMaximum(points: ChartPoint[]): number {
  let maximum = 0;
  for (const point of points) {
    assertNonnegativeFinite(point.value);
    maximum = Math.max(maximum, point.value);
  }
  return maximum;
}
