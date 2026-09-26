export interface Point {
  x: number;
  y: number;
}

export interface PathPose extends Point {
  angle: number;
}

/** A polyline enemies travel along, parameterized by distance from the spawn. */
export class Path {
  readonly cumulative: number[] = [0];
  readonly length: number;

  constructor(readonly points: Point[]) {
    if (points.length < 2) throw new Error('Path needs at least two points');
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      this.cumulative.push(total);
    }
    this.length = total;
  }

  pointAt(distance: number): PathPose {
    const d = Math.min(Math.max(distance, 0), this.length);
    let i = 1;
    while (i < this.cumulative.length - 1 && this.cumulative[i] < d) i++;
    const a = this.points[i - 1];
    const b = this.points[i];
    const segLen = this.cumulative[i] - this.cumulative[i - 1] || 1;
    const t = (d - this.cumulative[i - 1]) / segLen;
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      angle: Math.atan2(b.y - a.y, b.x - a.x),
    };
  }
}
