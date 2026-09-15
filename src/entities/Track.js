import { Vector2D } from '../physics/Vector2D.js';

export class Track {
  constructor() {
    this.name = "Monza Classic Circuit";
    this.width = 110; // Largura do leito da pista em pixels

    // Definição dos pontos da linha de corrida / traçado central
    this.waypoints = [
      new Vector2D(350, 880),
      new Vector2D(850, 880),
      new Vector2D(1350, 880),
      new Vector2D(1680, 800),
      new Vector2D(1780, 600),
      new Vector2D(1740, 360),
      new Vector2D(1520, 220),
      new Vector2D(1150, 220),
      new Vector2D(950, 320),
      new Vector2D(800, 320),
      new Vector2D(650, 200),
      new Vector2D(350, 200),
      new Vector2D(180, 380),
      new Vector2D(180, 720)
    ];

    // Gates para validação de voltas e parciais
    this.gates = [];
    this._generateGates();
  }

  _generateGates() {
    for (let i = 0; i < this.waypoints.length; i++) {
      const current = this.waypoints[i];
      const next = this.waypoints[(i + 1) % this.waypoints.length];

      const segment = next.clone().subtract(current);
      const normal = new Vector2D(-segment.y, segment.x).normalize();

      const p1 = current.clone().add(normal.clone().multiply(this.width * 0.75));
      const p2 = current.clone().subtract(normal.clone().multiply(this.width * 0.75));

      this.gates.push({
        id: i,
        p1,
        p2,
        center: current.clone()
      });
    }
  }

  getStartLine() {
    const p1 = this.waypoints[0];
    const p2 = this.waypoints[1];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return {
      position: p1.clone(),
      angle: angle
    };
  }

  // Verifica se o carro está no asfalto com base na distância até os segmentos
  isOnTrack(pos) {
    let minDistance = Infinity;

    for (let i = 0; i < this.waypoints.length; i++) {
      const a = this.waypoints[i];
      const b = this.waypoints[(i + 1) % this.waypoints.length];
      const dist = this._pointToSegmentDistance(pos, a, b);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    return minDistance <= (this.width / 2);
  }

  _pointToSegmentDistance(p, a, b) {
    const l2 = a.distanceTo(b) ** 2;
    if (l2 === 0) return p.distanceTo(a);

    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const proj = new Vector2D(
      a.x + t * (b.x - a.x),
      a.y + t * (b.y - a.y)
    );

    return p.distanceTo(proj);
  }

  render(ctx) {
    // 1. Gramado de fundo
    ctx.fillStyle = "#1e3822";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 2. Área de escape / Zebras externas (base alargada)
    ctx.strokeStyle = "#8c1515";
    ctx.lineWidth = this.width + 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    this._drawCircuitPath(ctx);

    // 3. Zebras internas (camada branca intermediária)
    ctx.strokeStyle = "#f0f3f6";
    ctx.lineWidth = this.width + 10;
    this._drawCircuitPath(ctx);

    // 4. Asfalto principal
    ctx.strokeStyle = "#25282a";
    ctx.lineWidth = this.width;
    this._drawCircuitPath(ctx);

    // 5. Linha divisória central (pontilhada)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 25]);
    this._drawCircuitPath(ctx);
    ctx.setLineDash([]); // Reset linha sólida

    // 6. Linha de Largada/Chegada
    this._drawStartGrid(ctx);
  }

  _drawCircuitPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i < this.waypoints.length; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  _drawStartGrid(ctx) {
    const gate = this.gates[0];
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(gate.p1.x, gate.p1.y);
    ctx.lineTo(gate.p2.x, gate.p2.y);
    ctx.stroke();

    // Padrão quadriculado simples na linha
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(gate.p1.x, gate.p1.y);
    ctx.lineTo(gate.p2.x, gate.p2.y);
    ctx.stroke();
    ctx.restore();
  }
}
