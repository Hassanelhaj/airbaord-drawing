/** One Euro filter: low jitter when moving slowly, low lag when moving fast. */
export class OneEuro {
  constructor(minCutoff = 1.5, beta = 0.012, dCutoff = 1) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  static alpha(cutoff, dt) {
    const r = 2 * Math.PI * cutoff * dt;
    return r / (r + 1);
  }

  reset() { this.x = this.dx = this.t = null; }

  filter(value, t) {
    if (this.x === null) {
      this.x = value; this.dx = 0; this.t = t;
      return value;
    }
    const dt = Math.max((t - this.t) / 1000, 1e-3);
    this.t = t;
    this.dx += OneEuro.alpha(this.dCutoff, dt) * ((value - this.x) / dt - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += OneEuro.alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }
}
